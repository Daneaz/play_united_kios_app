import React, {useContext, useEffect, useState} from 'react';
import {WebView} from 'react-native-webview';
import {Linking, View} from 'react-native';
import {GlobalContext} from '../states/GlobalState';
import {CN, RESET} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import TimerLayout from '../components/Layouts/TimerLayout';
import Colors from '../constants/Colors';
import {dispenseToken} from '../services/SerialService';

export default function FOMOPayScreen({route, navigation}) {
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState(null);
  const [lang, setLang] = useState();

  const [state, dispatch] = useContext(GlobalContext);

  useEffect(() => {
    if (state.time <= 0) {
      dispatch({type: RESET});
      navigation.navigate('Home');
    }
  }, [state.time]);

  useEffect(() => {
    setLang(state.language);
  }, [state.language]);

  useEffect(() => {
    let event = Linking.addEventListener('url', callback);
    return () => {
      event.remove();
    };
  }, []);

  function callback(data) {
    let {path, queryParams} = Linking.parse(data.url);
    if (path.includes('PaymentSuccess')) {
      setType('SUCCESS');
      setMsg('Payment success!!!');
      setTimeout(async () => {
        await handleDispenseToken();
      }, 500);
    } else if (path.includes('PaymentCancel')) {
      setType('ERROR');
      setMsg('Payment fail!!!');
    }
  }

  async function handleDispenseToken() {
    try {
      await dispenseToken(
        route.params.serialCom,
        '',
        route.params.tokens,
        setMsg,
        setType,
        lang,
      );
    } catch (error) {
      setType('ERROR');
      setMsg(JSON.stringify(error));
    }
  }

  return (
    <TimerLayout
      source={
        lang === CN
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
            source={{
              uri: route.params.url,
            }}
          />
        </View>
      </View>
    </TimerLayout>
  );
}
