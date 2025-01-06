import React, {useContext, useEffect, useRef, useState} from 'react';

import TimerLayout from '../components/Layouts/TimerLayout';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {fetchAPI, getData} from '../services/Utility';
import MessageDialog from '../components/MessageDialog';
import {GlobalContext} from '../states/GlobalState';
import * as Constant from '../constants/Constant';
import {
  CN,
  CREATED,
  DISPENSING,
  READY,
  RETRIEVE,
  STATUS_ONLINE,
  SUCCESS,
} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import {
  ConstructDispenseCmd,
  ConstructStatusCheckCmd,
  HandleResponse,
} from '../services/SerialService';
import {TimeStampTo10Digits} from '../services/DateTimeUtils';

export default function QRCodeScreen({route}) {
  const [status, setStatus] = useState(CREATED);
  const [qrCode, setQrCode] = useState(null);
  const [transId, setTransId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState(null);
  const statusTimer = useRef();
  const [instruction, setInstruction] = useState(null);

  const [state, dispatch] = useContext(GlobalContext);

  useEffect(() => {
    generateQRCode();
    return async () => {
      clearInterval(statusTimer.current);
    };
  }, []);

  useEffect(() => {
    // Assuming you want to log the latest message or use it in some logic
    const isOnline = async () => {
      if (state.result) {
        console.log('Latest Received Message:', state.result);
        if (state.result.status === STATUS_ONLINE) {
          let cmd = await ConstructDispenseCmd(
            instruction.token,
            instruction.uniqueCode,
          );

          await state.serialCom.send(cmd);
        } else {
          await HandleResponse(
            state.result,
            RETRIEVE,
            transId,
            setMsg,
            setType,
            state.language,
          );
        }
      }
    };
    isOnline();
  }, [state.result]); // Runs every time state.result changes

  useEffect(() => {
    return async () => {
      if (transId && status === CREATED) {
        await pushStatusToFail(transId);
      }
    };
  }, [transId]);

  async function generateQRCode() {
    try {
      let result = await fetchAPI(
        'POST',
        'tokenRetrieveMgt/tokenRetrieveQRCodeGenerator',
        {token: route.params.token},
      );
      let code = {
        noOfToken: result.token,
        uniqueId: result.uniqueId,
        machineId: result.machineId,
      };
      setQrCode(JSON.stringify(code));
      setTransId(result._id);
      let startTime = new Date();
      statusTimer.current = setInterval(() => {
        checkStatus(result._id, startTime);
      }, 5000);
    } catch (err) {
      setType('ERROR');
      setMsg(err);
    }
  }

  async function checkStatus(id, startTime) {
    try {
      let expiredTime = startTime.getTime() + 5 * 60000;
      if (expiredTime < new Date().getTime()) {
        clearInterval(statusTimer.current);
        await pushStatusToFail(transId);
      }

      let responseStatus = await fetchAPI(
        'GET',
        `tokenRetrieveMgt/checkStatusAndUpdate/${id}`,
      );
      if (responseStatus) {
        setStatus(DISPENSING);
        clearInterval(statusTimer.current);
        setType('SUCCESS');
        setMsg('Payment success!!!');
        dispatch({type: READY});
        setTimeout(async () => {
          await handleDispenseToken(id, route.params.token);
        }, 500);
      }
    } catch (err) {
      setType('ERROR');
      setMsg(err);
    }
  }

  async function handleDispenseToken(transId, token) {
    try {
      let user = await getData(Constant.USER);
      if (user.mobile <= 10) {
        await ConstructDispenseCmd(token);
      } else {
        // LeYaoYao needs to check status before dispense, and the unique code needs to be equal
        let timestamp = `00${TimeStampTo10Digits()}`;
        let instructObj = {
          uniqueCode: timestamp,
          token: token,
        };
        setInstruction(instructObj);
        let cmd = await ConstructStatusCheckCmd(timestamp);
        await state.serialCom.send(cmd);
      }
    } catch (error) {
      console.log('QRCodeScreen handleDispenseToken  err: ', error);
      setType('ERROR');
      setMsg(error);
    }
  }

  async function pushStatusToFail(transId) {
    try {
      await fetchAPI('GET', `tokenRetrieveMgt/pushToFail/${transId}`);
    } catch (err) {
      setType('ERROR');
      setMsg(err);
    }
  }

  return (
    <TimerLayout
      source={
        state.language === CN
          ? require('../assets/images/retrieve-bg-cn.png')
          : require('../assets/images/retrieve-bg-en.png')
      }
      text={state.time}>
      <View space={20} alignItems="center" paddingTop={5}>
        <View justifyContent={'center'}>
          <ImageBackground
            source={require('../assets/images/qr-code-bg.png')}
            style={styles.image}>
            <View justifyContent={'center'} style={styles.qrCode}>
              {qrCode && (
                <QRCode
                  value={qrCode}
                  logo={require('../assets/images/icon.png')}
                  size={calculate(142)}
                />
              )}
            </View>
          </ImageBackground>
        </View>
        <Text fontSize={calculate(15)} style={styles.text}>
          {state.language === CN
            ? '请用 Play United App 扫码完成取币'
            : 'Please use Play United App to scan the QR code'}
        </Text>
      </View>
      <MessageDialog type={type} msg={msg} close={() => setMsg(null)} />
    </TimerLayout>
  );
}

const styles = StyleSheet.create({
  image: {
    width: calculate(266),
    height: calculate(255),
  },
  text: {
    textAlign: 'center',
    maxWidth: calculate(200),
  },
  qrCode: {
    justifyContent: 'center',
    position: 'absolute',
    marginLeft: calculate(65),
    marginTop: calculate(72),
  },
});
