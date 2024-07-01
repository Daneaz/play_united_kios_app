import React, {useContext, useEffect, useState} from 'react';
import {WebView} from 'react-native-webview';
import {Linking, StyleSheet, View} from 'react-native';
import {GlobalContext} from '../states/GlobalState';
import {CN, RESET} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import TimerLayout from '../components/Layouts/TimerLayout';
import Colors from '../constants/Colors';

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
    } else if (path.includes('PaymentCancel')) {
      setType('ERROR');
      setMsg('Payment fail!!!');
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

const styles = StyleSheet.create({
  image: {
    flexDirection: 'row',
    width: '100%',
    height: calculate(50),
  },
  timerPosition: {
    marginTop: calculate(10),
    position: 'absolute',
    right: calculate(5),
  },
  timer: {
    width: calculate(70),
    height: calculate(30),
    resizeMode: 'stretch',
  },
  timerText: {
    textAlign: 'center',
    paddingTop: calculate(7),
    fontWeight: 'bold',
    fontSize: calculate(20),
    color: 'white',
  },
  homePosition: {
    position: 'absolute',
    right: '42%',
    bottom: calculate(120),
  },
  homeBtn: {
    width: calculate(50),
    height: calculate(50),
    resizeMode: 'stretch',
  },
  backBtn: {
    margin: calculate(15),
    width: calculate(24),
    height: calculate(20),
  },
  purchaseTitle: {
    width: calculate(180),
    height: calculate(40),
    margin: calculate(4),
    marginLeft: calculate(55),
  },
});
