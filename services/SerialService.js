import {fetchAPI, getData} from './Utility';
import * as Constant from '../constants/Constant';
import {CN} from '../constants/Constant';
import {TimeNowString} from '../services/DateTimeUtils';

export async function dispenseToken(
  serialCom,
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
    serialCom,
    cmd,
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
  let uniqueCode = stringToHex(TimeNowString());
  let amount = '0000'; // default to 0, not using it

  let checkSum = [];
  let tokenInHex = digitToHex(token, 4);

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
  transId,
  setMsg,
  setType,
  lang,
  token,
) {
  try {
    await serialCom.current.send(cmd);
    setType('SUCCESS');
    setMsg(
      lang === CN
        ? `${token}个币，出币中。。。`
        : `Dispensing ${token} token...`,
    );
    serialCom.current.onReceived(buff =>
      handlerReceived(user, buff, transId, setMsg, setType, lang),
    );
  } catch (error) {
    setType('ERROR');
    setMsg(JSON.stringify(error));
  }
}

async function handlerReceived(user, buff, transId, setMsg, setType, lang) {
  let hex = buff.toString('hex').toUpperCase();
  console.log('Received', formatHexMsg(hex));

  if (user.mobile < 10) {
    await handleAAResponse(hex, transId, setMsg, setType, lang);
  } else {
    await handleLeYaoYaoResponse(hex, transId, setMsg, setType, lang);
  }
}

async function handleLeYaoYaoResponse(hex, transId, setMsg, setType, lang) {
  let status = hex.substring(25, 27);
  let dispensedToken = hex.substring(27, 29);

  switch (status) {
    case '00':
      await pushStatusToFail(transId, setMsg, setType);
      return;
    case '01':
      await pushStatusToSuccess(transId, setMsg, setType);
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
      await proceedWithInterrupt(transId, dispensedToken, setMsg, setType);
      return;
  }
}

async function handleAAResponse(hex, transId, setMsg, setType, lang) {
  if (hex === '55AA04C00000C4') {
    setMsg(lang === CN ? '出币完毕' : 'All tokens has been dispensed');
    await pushStatusToSuccess(transId, setMsg, setType);
  } else {
    let dispensedToken = convertToDecimal(hex, 8, 12);
    setMsg(
      lang === CN
        ? `库存不足，请联系工作人员补币。 已出${dispensedToken}个币`
        : `Not enough token, please contact our staff to add more tokens. Dispensed ${dispensedToken} tokens`,
    );
    await proceedWithInterrupt(transId, dispensedToken, setMsg, setType);
  }
}

function convertToDecimal(hex, start, end) {
  let dispensedToken = parseInt(hex.substring(start, end), 16);
  console.log(dispensedToken);
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

function digitToHex(digit, size) {
  // Convert digit to hexadecimal string
  let hex = digit.toString(16).toUpperCase();

  // Pad with leading zeros to ensure two bytes (four characters)
  while (hex.length < size) {
    hex = '0' + hex;
  }

  return hex;
}

function stringToHex(str) {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).toUpperCase();
  }
  return hex;
}

async function proceedWithInterrupt(transId, dispensedToken, setType, setMsg) {
  try {
    await fetchAPI(
      'GET',
      `tokenRetrieveMgt/pushToInterrupt/${transId}/${dispensedToken}`,
    );
  } catch (err) {
    setType('ERROR');
    setMsg(err);
  }
}

async function pushStatusToSuccess(transId, setMsg, setType) {
  try {
    await fetchAPI('GET', `tokenRetrieveMgt/pushToSuccess/${transId}`);
  } catch (err) {
    setType('ERROR');
    setMsg(err);
  }
}

async function pushStatusToFail(transId, setMsg, setType) {
  try {
    await fetchAPI('GET', `tokenRetrieveMgt/pushToFail/${transId}`);
  } catch (err) {
    setType('ERROR');
    setMsg(err);
  }
}
