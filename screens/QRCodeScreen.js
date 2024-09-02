import React, {useContext, useEffect, useRef, useState} from 'react';

import TimerLayout from '../components/Layouts/TimerLayout';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {fetchAPI} from '../services/Utility';
import MessageDialog from '../components/MessageDialog';
import {GlobalContext} from '../states/GlobalState';
import {
  CN,
  CREATED,
  DISPENSING,
  RETRIEVE,
  SUCCESS,
} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import {dispenseToken} from '../services/SerialService';

export default function QRCodeScreen({route}) {
  const [status, setStatus] = useState(CREATED);
  const [qrCode, setQrCode] = useState(null);
  const [transId, setTransId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState(null);
  const statusTimer = useRef();

  const [state] = useContext(GlobalContext);

  useEffect(() => {
    generateQRCode();
    return async () => {
      clearInterval(statusTimer.current);
    };
  }, []);

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

  async function checkStatus(transId, startTime) {
    try {
      let expiredTime = startTime.getTime() + 5 * 60000;
      if (expiredTime < new Date().getTime()) {
        clearInterval(statusTimer.current);
        await pushStatusToFail(transId);
      }

      let token = await fetchAPI(
        'GET',
        `tokenRetrieveMgt/checkStatusAndUpdate/${transId}`,
      );
      if (token) {
        setStatus(DISPENSING);
        clearInterval(statusTimer.current);
        setType('SUCCESS');
        setMsg('Payment success!!!');
        setTimeout(async () => {
          await handleDispenseToken(transId, token);
        }, 500);
      }
    } catch (err) {
      setType('ERROR');
      setMsg(err);
    }
  }

  async function handleDispenseToken(transId, token) {
    try {
      await dispenseToken(
        state.serialCom,
        RETRIEVE,
        transId,
        token,
        setMsg,
        setType,
        state.language,
      );
    } catch (error) {
      setType('ERROR');
      setMsg(JSON.stringify(error));
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
