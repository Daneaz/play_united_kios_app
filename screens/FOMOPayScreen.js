import React, {useContext, useEffect, useState} from 'react';
import {WebView} from 'react-native-webview';
import {View} from 'react-native';
import {GlobalContext} from '../states/GlobalState';
import {CN, PURCHASE, RESET, SUCCESS} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import TimerLayout from '../components/Layouts/TimerLayout';
import Colors from '../constants/Colors';
import {dispenseToken} from '../services/SerialService';
import MessageDialog from '../components/MessageDialog';
import {fetchAPI} from '../services/Utility';
import queryString from 'query-string';

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

  const shouldStartLoadWithRequest = request => {
    try {
      const {url} = request;
      console.log(!url.startsWith('playunited://'));
      return !url.startsWith('playunited://');
    } catch (err) {
      console.log(err);
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
            setTimeout(async () => {
              await handleDispenseToken(id);
            }, 500);
          } else {
            setType('ERROR');
            setMsg('Payment fail!!!');
          }
        } else if (url.includes('PaymentCancel')) {
          setType('ERROR');
          setMsg('Payment fail!!!');
        }
      } else if (url.includes('PaymentCancel')) {
        setType('ERROR');
        setMsg('Payment fail!!!');
      }
    } catch (err) {
      setType('ERROR');
      setMsg(JSON.stringify(err));
    }
  };

  async function handleDispenseToken(id) {
    try {
      await dispenseToken(
        state.serialCom,
        PURCHASE,
        id,
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
