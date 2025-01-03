import React, {createContext, useEffect, useReducer, useState} from 'react';
import * as Constant from '../constants/Constant';
import {
  CLOSE,
  CN,
  EN,
  INIT,
  MESSAGE_RECEIVED,
  READY,
  RESET,
  START,
  STATUS_DISPENSING,
  STATUS_FAIL,
  STATUS_NOT_ENOUGH_TOKEN,
  STATUS_OFFLINE,
  STATUS_ONLINE,
  STATUS_PROCESS_DISPENSING,
  STATUS_SUCCESS,
  STATUS_UNKNOWN,
  TICK,
} from '../constants/Constant';
import {getData} from '../services/Utility';
import SerialPortAPI from 'react-native-serial-port-api';
import {SERIAL} from '@env';
import MessageDialog from '../components/MessageDialog';

export const GlobalContext = createContext();

const initialState = {
  time: 300,
  isRunning: false,
  language: EN,
  serialCom: null,
  result: '',
  readyToReceived: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case START:
      return {...state, isRunning: true};
    case RESET:
      return {...state, isRunning: false, time: 300, readyToReceived: false};
    case TICK:
      return {...state, time: state.time - 1};
    case CN:
      return {...state, language: CN};
    case EN:
      return {...state, language: EN};
    case INIT:
      return {...state, serialCom: action.payload};
    case READY:
      return {...state, readyToReceived: true};
    case MESSAGE_RECEIVED:
      if (!state.readyToReceived) {
        return {...state};
      }
      return {...state, result: action.payload};
    case CLOSE:
      if (SERIAL === 'LOCAL') {
        state.serialCom = null;
      } else {
        state.serialCom.close();
      }
      return {...state, serialCom: action.payload};
    default:
      return state;
  }
};

export const GlobalContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState(null);

  useEffect(() => {
    const initSerialCom = async () => {
      try {
        console.log('SERIAL Mode:', SERIAL);
        if (SERIAL === 'LOCAL') {
          const webSocket = new WebSocket('ws://10.0.2.2:8080'); // 在模拟器中访问本地主机

          webSocket.onopen = () => {
            console.log('WebSocket connected');
            dispatch({type: INIT, payload: webSocket});
          };

          webSocket.onmessage = event => {
            console.log('WebSocket Received Original: ', event.data);
            console.log(
              'WebSocket Received Formatted: ',
              formatHexMsg(event.data),
            );
            let result = handleLeYaoYaoResponse(event.data);
            dispatch({type: MESSAGE_RECEIVED, payload: result});
          };

          webSocket.onclose = () => {
            console.log('WebSocket closed');
            dispatch({type: CLOSE});
          };
        } else {
          let port, baudRate;
          let user = await getData(Constant.USER);
          if (user === null) {
            setType('ERROR');
            setMsg('Please Login');
            return;
          }
          if (user.mobile === 0) {
            port = '/dev/ttyS2';
            baudRate = 115200;
          } else if (user.mobile <= 10) {
            port = '/dev/ttyS3';
            baudRate = 115200;
          } else {
            port = '/dev/ttyS1';
            baudRate = 38400;
          }
          let serialCom = await SerialPortAPI.open(port, {
            baudRate: baudRate,
          });
          serialCom.onReceived(async buff => {
            let hex = buff.toString('hex').toUpperCase();
            console.log('SerialCom Received Original: ', hex);
            console.log('SerialCom Received Formatted: ', formatHexMsg(hex));
            let result;
            if (user.mobile <= 10) {
              result = handleAAResponse(hex);
            } else {
              result = handleLeYaoYaoResponse(hex);
            }
            dispatch({type: MESSAGE_RECEIVED, payload: result});
          });

          dispatch({type: INIT, payload: serialCom});
        }
      } catch (error) {
        console.log('GlobalState GlobalContextProvider err: ', error);
        setType('ERROR');
        setMsg(error);
      }
    };
    initSerialCom();
    return () => {
      dispatch({type: CLOSE});
    };
  }, [dispatch]);

  return (
    <GlobalContext.Provider value={[state, dispatch]}>
      {props.children}
      <MessageDialog type={type} msg={msg} close={() => setMsg(null)} />
    </GlobalContext.Provider>
  );
};

function handleLeYaoYaoResponse(hex) {
  console.log('hex size: ', hex.length);
  switch (hex.length) {
    case 28:
      // check status result, expecting 1
      let machineStatus = hex.substring(23, 24);
      if (machineStatus === '1') {
        return {status: STATUS_ONLINE, token: 0};
      } else {
        return {status: STATUS_OFFLINE, token: 0};
      }
    case 44:
      // dispensing result
      let status = hex.substring(26, 28);
      let dispensedToken = hexReorderAndConvert(hex.substring(28, 32));
      switch (status) {
        case '00':
          return {status: STATUS_FAIL, token: dispensedToken};
        case '01':
          return {status: STATUS_SUCCESS, token: dispensedToken};
        case '02':
          return {status: STATUS_DISPENSING, token: dispensedToken};
        case '03':
          return {status: STATUS_NOT_ENOUGH_TOKEN, token: dispensedToken};
        default:
          return {status: STATUS_UNKNOWN, token: dispensedToken};
      }
    case 30:
      // progress of dispensing token, sometimes we dont have the above result
      // we have to analyse base of this response
      let unfinishedDispenseToken = hexReorderAndConvert(hex.substring(22, 26));
      console.log('unfinishedDispenseToken: ', unfinishedDispenseToken);
      if (unfinishedDispenseToken === 0) {
        return {status: STATUS_SUCCESS, token: unfinishedDispenseToken};
      } else {
        return {
          status: STATUS_PROCESS_DISPENSING,
          token: unfinishedDispenseToken,
        };
      }
    case 36:
      console.log('Unknown Error');
      // problem with machine, maybe out of token
      return {status: STATUS_UNKNOWN, token: 0};
    default:
      return {status: STATUS_UNKNOWN, token: 0};
  }
}

async function handleAAResponse(hex) {
  if (hex === '55AA04C00000C4') {
    return {status: STATUS_SUCCESS, token: '0'};
  } else {
    let dispensedToken = convertToDecimal(hex, 8, 12);
    return {status: STATUS_NOT_ENOUGH_TOKEN, token: dispensedToken};
  }
}

function hexReorderAndConvert(hex) {
  // Ensure the hex string is 4 characters long and uppercase
  hex = hex.toUpperCase().padStart(4, '0');

  // Extract lower and higher bytes
  let lowerByte = hex.substring(0, 2); // Lower byte (first 2 characters)
  let higherByte = hex.substring(2); // Higher byte (last 2 characters)

  // Convert it back
  let reorderedHex = higherByte + lowerByte;
  console.log('Received Token in reordered Hex: ', reorderedHex);
  // Convert reordered hex to decimal
  console.log('Received Token in decimal: ', parseInt(reorderedHex, 16));
  return parseInt(reorderedHex, 16);
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

function convertToDecimal(hex, start, end) {
  return parseInt(hex.substring(start, end), 16);
}
