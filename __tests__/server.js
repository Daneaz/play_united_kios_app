// to simulate serial communication
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    console.log('Received:', message);
    // 这里可以处理接收到的消息并选择是否发送回去
    const hex = message.toString('utf-8');
    console.log('Received hex:', hex);
    processLeYaoYaoResponse(ws, hex);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

async function processLeYaoYaoResponse(ws, message) {
  let response;
  let header = 'AA';
  let tail = 'DD';
  switch (message.length) {
    case 26:
      // --> AA0A01D101001728106574E5DD
      // <<-- AA0B02D10100172810657401E6DD
      let msg = `${message.substring(2, 22)}01`;
      let checksum = calculateCheckSum(msg);
      response = header + msg + checksum + tail;

      sendMsg(ws, response);
      break;
    case 34:
      // 10 个币 0A00 = 成功, 2条过程, 成功结果
      // 20 个币 1400 = 币不足, 3条过程, 无结果
      // 20 个币 1400 = 币不足, 2条过程, 失败结果
      // 100 个币 6400 = 失败, 故障结果
      // -->> AA0E01D10230383135353064000A00BBDD (出币命令)
      // <<-- AA0C02D1206400000064005000AFDD (出币过程, 多条)
      // <<-- AA0F02140204010064000000000000007ADD (出币故障)
      // <<-- AA1302D1053038313535300000010A00XXXXXXXXFFDD (出币结果)
      let token = message.substring(26, 28);
      let uniqueCode = message.substring(10, 22);
      console.log('Received Token: ', token);
      console.log('Received uniqueCode: ', uniqueCode);
      switch (token) {
        case '0A':
          await delay(1000);
          response = constructDispenseProcess('06');
          sendMsg(ws, response);
          await delay(1000);
          response = constructDispenseProcess('03');
          sendMsg(ws, response);
          await delay(1000);
          response = constructSuccessDispenseResult(uniqueCode);
          sendMsg(ws, response);
          break;
        case '14':
          await delay(1000);
          response = constructDispenseProcess('06');
          sendMsg(ws, response);
          await delay(1000);
          response = constructDispenseProcess('03');
          sendMsg(ws, response);
          await delay(1000);
          response = constructDispenseProcess('01');
          sendMsg(ws, response);
          await delay(1000);
          response = constructNotEnoughDispenseResult(uniqueCode);
          sendMsg(ws, response);
          break;
        case '1E':
          await delay(1000);
          response = constructDispenseProcess('06');
          sendMsg(ws, response);
          await delay(1000);
          response = constructDispenseProcess('03');
          sendMsg(ws, response);
          await delay(1000);
          response = constructFailedDispenseResult(uniqueCode);
          sendMsg(ws, response);
          break;
        case '64':
          await delay(1000);
          response = constructErrorResult(uniqueCode);
          sendMsg(ws, response);
          break;
      }

      break;
  }

  return response;
}

function sendMsg(ws, msg) {
  console.log('Send: ', msg);
  ws.send(msg);
}

function constructErrorResult() {
  // AA0F02140204010064000000000000007ADD
  let msg = `0F0214020401006400000000000000`;
  let header = 'AA';
  let tail = 'DD';
  let checksum = calculateCheckSum(msg);
  return header + msg + checksum + tail;
}

function constructSuccessDispenseResult(uniqueCode) {
  // AA1302D1053038313535300000010A00XXXXXXXXFFDD
  let msg = `1302D105${uniqueCode}A000010A0011111111`;
  let header = 'AA';
  let tail = 'DD';
  let checksum = calculateCheckSum(msg);
  return header + msg + checksum + tail;
}

function constructFailedDispenseResult(uniqueCode) {
  // AA1302D1053038313535300000010A00XXXXXXXXFFDD
  let msg = `1302D105${uniqueCode}A00000010011111111`;
  let header = 'AA';
  let tail = 'DD';
  let checksum = calculateCheckSum(msg);
  return header + msg + checksum + tail;
}

function constructNotEnoughDispenseResult(uniqueCode) {
  // AA1302D1053038313535300000010A00XXXXXXXXFFDD
  let msg = `1302D105${uniqueCode}A00003130011111111`;
  let header = 'AA';
  let tail = 'DD';
  let checksum = calculateCheckSum(msg);
  return header + msg + checksum + tail;
}

function constructDispenseProcess(token) {
  // AA0C02D1206400000064005000AFDD
  let msg = `0C02D120640000006400${token}00`;
  let header = 'AA';
  let tail = 'DD';
  let checksum = calculateCheckSum(msg);
  return header + msg + checksum + tail;
}

function calculateCheckSum(msg) {
  let checkSum = [];
  for (let i = 0; i < msg.length; i = i + 2) {
    checkSum.push(msg.substring(i, i + 2));
  }

  let sum = 0;
  for (let i = 0; i < checkSum.length; i++) {
    // eslint-disable-next-line no-bitwise
    sum = sum ^ parseInt(checkSum[i], 16);
  }
  sum = ('00' + sum.toString(16).toUpperCase()).slice(-2);
  return sum;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
