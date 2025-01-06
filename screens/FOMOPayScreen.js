import React, {useContext, useEffect, useState} from 'react';
import {WebView} from 'react-native-webview';
import {View} from 'react-native';
import {GlobalContext} from '../states/GlobalState';
import * as Constant from '../constants/Constant';
import {
  CN,
  PURCHASE,
  READY,
  STATUS_ONLINE,
  SUCCESS,
} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import TimerLayout from '../components/Layouts/TimerLayout';
import Colors from '../constants/Colors';
import {
  ConstructDispenseCmd,
  ConstructStatusCheckCmd,
  HandleResponse,
} from '../services/SerialService';
import MessageDialog from '../components/MessageDialog';
import {fetchAPI, getData} from '../services/Utility';
import queryString from 'query-string';
import {TimeStampTo10Digits} from '../services/DateTimeUtils';

export default function FOMOPayScreen({route, navigation}) {
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState(null);
  const [state, dispatch] = useContext(GlobalContext);
  const [instruction, setInstruction] = useState(null);
  const [transId, setTransId] = useState(null);

  // const [url, setUrl] = useState(route.params.url);
  // useEffect(() => {
  //   setTimeout(async () => {
  //     setUrl('playunited://something_PaymentSuccess');
  //   }, 5000);
  // }, []);

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
            PURCHASE,
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

  const shouldStartLoadWithRequest = request => {
    try {
      const {url} = request;
      return !url.startsWith('playunited://');
    } catch (err) {
      return false;
    }
  };

  const handleNavigationChange = async navState => {
    try {
      const {url} = navState;
      if (url.includes('PaymentSuccess')) {
        const parsed = queryString.parseUrl(url);
        const id = parsed.query.id;
        // In case of channel callback delay, we query to check with them first
        // check status and update it to success before pushing to Dispensing
        let success = await fetchAPI('GET', `orderMgt/queryOrder/${id}`);
        if (success) {
          let status = await fetchAPI('GET', `orderMgt/pushToDispensing/${id}`);
          if (status) {
            setType(SUCCESS);
            setMsg('Payment success!!!');
            setTransId(id);
            dispatch({type: READY});
            setTimeout(async () => {
              await handleDispenseToken();
            }, 500);
          } else {
            setType('ERROR');
            setMsg('Unable to find order!!!');
          }
        } else {
          setType('ERROR');
          setMsg('Payment fail!!!');
        }
      } else if (url.includes('PaymentCancel')) {
        setType('ERROR');
        setMsg('Payment fail or Duplicated transaction!!!');
      }
    } catch (err) {
      setType('ERROR');
      setMsg(JSON.stringify(err));
    }
  };

  async function handleDispenseToken(id) {
    try {
      let token = route.params.tokens;
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
      console.log('FOMOPayScreen handleDispenseToken err: ', error);
      setType('ERROR');
      setMsg(error);
    }
  }

  return (
    <TimerLayout
      source={
        state.language === CN
          ? require('../assets/images/purchase-bg-cn.png')
          : require('../assets/images/purchase-bg-en.png')
      }
      text={state.time}>
      <View
        style={{
          marginHorizontal: calculate(75),
          marginVertical: calculate(90),
        }}>
        <View style={{height: '51%'}}>
          <WebView
            style={{backgroundColor: Colors.white}}
            onNavigationStateChange={handleNavigationChange}
            onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
            source={{
              uri: route.params.url,
            }}
          />
        </View>
      </View>
      <MessageDialog type={type} msg={msg} close={() => setMsg(null)} />
    </TimerLayout>
  );
}
