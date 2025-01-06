import {fetchAPI, getData} from './Utility';
import * as Constant from '../constants/Constant';
import {
  CN,
  PURCHASE,
  RETRIEVE,
  STATUS_DISPENSING,
  STATUS_FAIL,
  STATUS_NOT_ENOUGH_TOKEN,
  STATUS_OFFLINE,
  STATUS_ONLINE,
  STATUS_PROCESS_DISPENSING,
  STATUS_SUCCESS,
  STATUS_UNKNOWN,
} from '../constants/Constant';

export async function ConstructStatusCheckCmd(uniqueCode) {
  return constructLeYaoYaoCheckStatusCmd('D101', '0A', uniqueCode);
}

export async function ConstructDispenseCmd(token, uniqueCode) {
  let user = await getData(Constant.USER);
  let cmd;
  if (user.mobile === 0) {
    cmd = constructFEHeaderMsg('02', `${token}`);
  } else if (user.mobile < 10) {
    cmd = constructAAHexCmd('C0', '04', token);
  } else {
    // LeYaoyao need to check the status before dispense
    cmd = constructLeYaoYaoDispenseCmd('D102', '0E', token, uniqueCode);
  }
  return cmd;
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

function constructLeYaoYaoCheckStatusCmd(cmdType, dataSize, uniqueCode) {
  let header = 'AA';
  let tail = 'DD';
  let index = '01';
  let cmd = cmdType.substring(0, 2);
  let subcmd = cmdType.substring(2, 4);
  let checkSum = [];
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
  let fullCmd =
    header +
    dataSize +
    index +
    cmdType +
    uniqueCode +
    calculateCheckSum(checkSum) +
    tail;
  console.log(`CheckStatusCmd: ${formatHexMsg(fullCmd)}`);
  return fullCmd;
}

function constructLeYaoYaoDispenseCmd(cmdType, dataSize, token, uniqueCode) {
  let header = 'AA';
  let tail = 'DD';
  let index = '01'; // indicating the identity is APP
  let cmd = cmdType.substring(0, 2);
  let subcmd = cmdType.substring(2, 4);
  // use the 10 digit timestamp add 00 as prefix to form a 12 char string
  let amount = '0001'; // default to 1, not using it, but also cannot be 0

  let checkSum = [];
  let tokenInHex = decimalToHexLowHigh(Number(token));

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
  console.log(`DispenseCmd: ${formatHexMsg(fullCmd)}`);
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

export async function HandleResponse(
  result,
  transType,
  transId,
  setMsg,
  setType,
  lang,
) {
  switch (result.status) {
    case STATUS_ONLINE:
      break;
    case STATUS_OFFLINE:
    case STATUS_FAIL:
      if (transId) {
        await pushStatusToFail(transType, transId, setMsg, setType);
      }
      setType('ERROR');
      setMsg(
        lang === CN
          ? '出币失败。。。请联系工作人员'
          : 'Dispensing Fail, Please contact our staff...',
      );
      break;
    case STATUS_SUCCESS:
      if (transId) {
        await pushStatusToSuccess(transType, transId, setMsg, setType);
      }
      setMsg(lang === CN ? '出币完毕' : 'All tokens has been dispensed');
      break;
    case STATUS_DISPENSING:
      setMsg(
        lang === CN
          ? `正在出币。。。已出${result.token}`
          : `Dispensing tokens, Dispensed ${result.token} tokens`,
      );
      break;
    case STATUS_PROCESS_DISPENSING:
      setMsg(
        lang === CN
          ? `正在出币。。。剩余 ${result.token}`
          : `Dispensing tokens, Remaining ${result.token} tokens`,
      );
      break;
    case STATUS_NOT_ENOUGH_TOKEN:
      setType('ERROR');
      setMsg(
        lang === CN
          ? `库存不足，请联系工作人员补币。 已出${result.token}个币`
          : `Not enough token, please contact our staff to add more tokens. Dispensed ${result.token} tokens`,
      );
      if (transId) {
        await proceedWithInterrupt(
          transType,
          transId,
          result.token,
          setMsg,
          setType,
        );
      }
      break;
    case STATUS_UNKNOWN:
      setType('ERROR');
      setMsg(
        lang === CN
          ? '库存不足/或故障，请联系工作人员'
          : 'Not enough token or encounter issue, please contact our staff',
      );
      break;
    default:
      setType('ERROR');
      setMsg(
        lang === CN
          ? '未知故障，请联系工作人员'
          : 'Unknown Error, please contact our staff',
      );
      break;
  }
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
