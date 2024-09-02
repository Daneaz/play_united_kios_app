import {fetchAPI, getData} from './Utility';
import * as Constant from '../constants/Constant';
import {CN, PURCHASE, RETRIEVE} from '../constants/Constant';
import {TimeStampTo10Digits} from './DateTimeUtils';

export async function dispenseToken(
  serialCom,
  transType,
  transId,
  token,
  setMsg,
  setType,
  lang,
) {
  setMsg(
    lang === CN ? '正在发送命令。。。' : 'Sending command to token machine',
  );
  let user = await getData(Constant.USER);
  let cmd;
  if (user.mobile === 0) {
    cmd = constructFEHeaderMsg('02', `${token}`);
  } else if (user.mobile < 10) {
    cmd = constructAAHexCmd('C0', '04', token);
  } else {
    cmd = constructLeYaoYaoCmd('D102', '0E', token);
  }
  return await executeCmd(
    user,
    serialCom,
    cmd,
    transType,
    transId,
    setMsg,
    setType,
    lang,
    token,
  );
}

export async function openOrCloseCashier(serialCom, open, setMsg, setType) {
  let user = await getData(Constant.USER);
  let cmd;
  if (user.mobile === 0) {
    if (open) {
      cmd = constructFEHeaderMsg('01', '02');
    } else {
      cmd = constructFEHeaderMsg('01', '00');
    }
  } else {
    if (open) {
      cmd = constructAAHexCmd('C2', '03', '01');
    } else {
      cmd = constructAAHexCmd('C2', '03', '00');
    }
  }

  await executeCmd(user, serialCom, cmd, setMsg, setType);
}

function constructAAHexCmd(cmdType, dataSize, data) {
  let header = '55AA';
  let checkSum = [];
  let cmdInHex;
  if (cmdType === 'C0') {
    cmdInHex = ('0000' + parseInt(data).toString(16).toUpperCase()).slice(-4);
  } else if (cmdType === 'C2') {
    cmdInHex = ('00' + parseInt(data).toString(16).toUpperCase()).slice(-2);
  }

  let cmd = header + dataSize + cmdType + cmdInHex;
  checkSum.push(dataSize);
  checkSum.push(cmdType);
  checkSum.push(cmdInHex.substring(0, 2));
  checkSum.push(cmdInHex.substring(2, 4));
  cmd += calculateCheckSum(checkSum);
  console.log(`cmd: ${formatHexMsg(cmd)}`);
  return cmd;
}

function constructLeYaoYaoCmd(cmdType, dataSize, token) {
  let header = 'AA';
  let tail = 'DD';
  let index = '01'; // indicating the identity is APP
  let cmd = cmdType.substring(0, 2);
  let subcmd = cmdType.substring(2, 4);
  // use the 10 digit timestamp add 00 as prefix to form a 12 char string
  let uniqueCode = `00${TimeStampTo10Digits()}`;
  let amount = '0001'; // default to 1, not using it, but also cannot be 0

  let checkSum = [];
  let tokenInHex = decimalToHexLowHigh(token);

  checkSum.push(dataSize);
  checkSum.push(index);
  checkSum.push(cmd);
  checkSum.push(subcmd);
  checkSum.push(uniqueCode.substring(0, 2));
  checkSum.push(uniqueCode.substring(2, 4));
  checkSum.push(uniqueCode.substring(4, 6));
  checkSum.push(uniqueCode.substring(6, 8));
  checkSum.push(uniqueCode.substring(8, 10));
  checkSum.push(uniqueCode.substring(10, 12));
  checkSum.push(amount.substring(0, 2));
  checkSum.push(amount.substring(2, 4));
  checkSum.push(tokenInHex.substring(0, 2));
  checkSum.push(tokenInHex.substring(2, 4));

  let fullCmd =
    header +
    dataSize +
    index +
    cmdType +
    uniqueCode +
    amount +
    tokenInHex +
    calculateCheckSum(checkSum) +
    tail;
  console.log(`cmd: ${formatHexMsg(fullCmd)}`);
  return fullCmd;
}

function calculateCheckSum(checkSum) {
  let sum = 0;
  for (let i = 0; i < checkSum.length; i++) {
    // eslint-disable-next-line no-bitwise
    sum = sum ^ parseInt(checkSum[i], 16);
  }
  sum = ('00' + sum.toString(16).toUpperCase()).slice(-2);
  return sum;
}

async function executeCmd(
  user,
  serialCom,
  cmd,
  transType,
  transId,
  setMsg,
  setType,
  lang,
  token,
) {
  try {
    await serialCom.send(cmd);
    setType('SUCCESS');
    setMsg(
      lang === CN
        ? `${token}个币，出币中。。。`
        : `Dispensing ${token} token...`,
    );
    serialCom.onReceived(buff =>
      handlerReceived(user, buff, transType, transId, setMsg, setType, lang),
    );
  } catch (error) {
    setType('ERROR');
    setMsg(JSON.stringify(error));
  }
}

async function handlerReceived(
  user,
  buff,
  transType,
  transId,
  setMsg,
  setType,
  lang,
) {
  let hex = buff.toString('hex').toUpperCase();
  console.log('Received', formatHexMsg(hex));

  if (user.mobile < 10) {
    await handleAAResponse(hex, transType, transId, setMsg, setType, lang);
  } else {
    await handleLeYaoYaoResponse(
      hex,
      transType,
      transId,
      setMsg,
      setType,
      lang,
    );
  }
}

async function handleLeYaoYaoResponse(
  hex,
  transType,
  transId,
  setMsg,
  setType,
  lang,
) {
  switch (hex.length) {
    case 44:
      // dispensing result
      let status = hex.substring(26, 28);
      let dispensedToken = hexReorderAndConvert(hex.substring(28, 32));

      switch (status) {
        case '00':
          if (transId) {
            await pushStatusToFail(transType, transId, setMsg, setType);
          }
          setMsg(
            lang === CN
              ? '出币失败。。。正在退还'
              : 'Dispensing Fail, Refunding...',
          );
          return;
        case '01':
          if (transId) {
            await pushStatusToSuccess(transType, transId, setMsg, setType);
          }
          setMsg(lang === CN ? '出币成功。。。' : 'Dispensing Success');
          return;
        case '02':
          setMsg(
            lang === CN
              ? `正在出币。。。 已出${dispensedToken}个币`
              : `Dispensing... Dispensed ${dispensedToken} tokens`,
          );
          return;
        case '03':
          setMsg(
            lang === CN
              ? `库存不足，请联系工作人员补币。 已出${dispensedToken}个币`
              : `Not enough token, please contact our staff to add more tokens. Dispensed ${dispensedToken} tokens`,
          );

          if (transId) {
            await proceedWithInterrupt(
              transType,
              transId,
              dispensedToken,
              setMsg,
              setType,
            );
          }
          return;
      }
      break;
    case 30:
      // progress of dispensing token, sometimes we dont have the above result
      // we have to analyse base of this response
      let unfinishedDispenseToken = hexReorderAndConvert(hex.substring(22, 26));
      if (unfinishedDispenseToken === 0) {
        if (transId) {
          await pushStatusToSuccess(transType, transId, setMsg, setType);
        }
        return;
      } else {
        setMsg(
          lang === CN
            ? `正在出币。。。 剩余${unfinishedDispenseToken}个币`
            : `Dispensing... Remaining ${unfinishedDispenseToken} tokens`,
        );
      }
      break;
    case 36:
      // problem with machine, maybe out of token
      setMsg(
        lang === CN
          ? '库存不足/或故障，请联系工作人员补币'
          : 'Not enough token or encounter issue, please contact our staff',
      );
      break;
    default:
      setMsg(
        lang === CN
          ? '未知故障，请联系工作人员补币'
          : 'Unknown Error, please contact our staff',
      );
  }
}

async function handleAAResponse(
  hex,
  transType,
  transId,
  setMsg,
  setType,
  lang,
) {
  if (hex === '55AA04C00000C4') {
    setMsg(lang === CN ? '出币完毕' : 'All tokens has been dispensed');
    if (transId) {
      await pushStatusToSuccess(transType, transId, setMsg, setType);
    }
  } else {
    let dispensedToken = convertToDecimal(hex, 8, 12);
    setMsg(
      lang === CN
        ? `库存不足，请联系工作人员补币。 已出${dispensedToken}个币`
        : `Not enough token, please contact our staff to add more tokens. Dispensed ${dispensedToken} tokens`,
    );
    if (transId) {
      await proceedWithInterrupt(
        transType,
        transId,
        dispensedToken,
        setMsg,
        setType,
      );
    }
  }
}

function convertToDecimal(hex, start, end) {
  let dispensedToken = parseInt(hex.substring(start, end), 16);
  return dispensedToken;
}

function formatHexMsg(msg) {
  let out = '';
  msg = msg.split('');
  for (let i = 0; i < msg.length; i++) {
    if (i % 2 === 1) {
      out += msg[i] + ' ';
    } else {
      out += msg[i];
    }
  }
  return out;
}

function constructFEHeaderMsg(cmdType, data) {
  let header = 'FE';
  let tail = 'EF';
  let cmd = header + cmdType;
  let checkSum = [];
  checkSum.push(cmdType);
  let sum = 0;
  for (let i = data.length; i < 4; i++) {
    cmd += '00';
  }
  for (let i = 0; i < data.length; i++) {
    cmd += '0' + data[i];
    checkSum.push('0' + data[i]);
  }
  for (let i = 0; i < checkSum.length; i++) {
    sum = sum ^ parseInt(checkSum[i], 16);
  }
  sum = sum.toString(16);
  if (sum.length === 1) {
    sum = '0' + sum.toString(16);
  }
  cmd += sum + tail;
  console.log(formatHexMsg(cmd));
  return cmd;
}

function decimalToHexLowHigh(decimal) {
  // Ensure the decimal number is in range for 2 bytes (0-65535)
  if (decimal < 0 || decimal > 65535) {
    throw new Error('Decimal number out of range (0-65535)');
  }

  // Convert decimal to a 4-character hexadecimal string
  let hex = decimal.toString(16).toUpperCase().padStart(4, '0');

  // Extract lower and higher bytes
  let lowerByte = hex.substring(0, 2); // Lower byte (first 2 characters)
  let higherByte = hex.substring(2); // Higher byte (last 2 characters)

  // Concatenate lower byte on the left, then higher byte on the right
  return higherByte + lowerByte;
}

function hexReorderAndConvert(hex) {
  // Ensure the hex string is 4 characters long and uppercase
  hex = hex.toUpperCase().padStart(4, '0');

  // Extract lower and higher bytes
  let lowerByte = hex.substring(0, 2); // Lower byte (first 2 characters)
  let higherByte = hex.substring(2); // Higher byte (last 2 characters)

  // Convert it back
  let reorderedHex = higherByte + lowerByte;

  // Convert reordered hex to decimal
  return parseInt(reorderedHex, 16);
}

async function proceedWithInterrupt(
  transType,
  transId,
  dispensedToken,
  setType,
  setMsg,
) {
  try {
    switch (transType) {
      case PURCHASE:
        await fetchAPI(
          'GET',
          `orderMgt/pushToInterrupt/${transId}/${dispensedToken}`,
        );
        break;
      case RETRIEVE:
        await fetchAPI(
          'GET',
          `tokenRetrieveMgt/pushToInterrupt/${transId}/${dispensedToken}`,
        );
        break;
    }
  } catch (err) {
    setType('ERROR');
    setMsg(err);
  }
}

async function pushStatusToSuccess(transType, transId, setMsg, setType) {
  try {
    switch (transType) {
      case PURCHASE:
        await fetchAPI('GET', `orderMgt/pushToDispensed/${transId}`);
        break;
      case RETRIEVE:
        await fetchAPI('GET', `tokenRetrieveMgt/pushToSuccess/${transId}`);
        break;
    }
  } catch (err) {
    setType('ERROR');
    setMsg(err);
  }
}

async function pushStatusToFail(transType, transId, setMsg, setType) {
  try {
    switch (transType) {
      case PURCHASE:
        await fetchAPI('GET', `orderMgt/pushToFail/${transId}`);
        break;
      case RETRIEVE:
        await fetchAPI('GET', `tokenRetrieveMgt/pushToFail/${transId}`);
        break;
    }
  } catch (err) {
    setType('ERROR');
    setMsg(err);
  }
}
