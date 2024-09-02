import React, {useContext, useEffect, useState} from 'react';

import TimerLayout from '../components/Layouts/TimerLayout';
import ImageButton from '../components/Button/ImageButton';
import {StyleSheet, View} from 'react-native';
import {GlobalContext} from '../states/GlobalState';
import {CN} from '../constants/Constant';
import InputModel from '../components/Input/InputModel';
import calculate from '../services/DimensionAdapter';

export default function RetrieveTokenScreen({navigation, route}) {
  const [tokenLang, setTokenLang] = useState();
  const [open, setOpen] = useState();

  const [state] = useContext(GlobalContext);

  useEffect(() => {
    if (state.language === CN) {
      setTokenLang('币');
    } else {
      setTokenLang('Tokens');
    }
  }, [state.language]);

  return (
    <TimerLayout
      source={
        state.language === CN
          ? require('../assets/images/retrieve-bg-cn.png')
          : require('../assets/images/retrieve-bg-en.png')
      }
      text={state.time}
      clearTimer={true}>
      <View style={styles.colum}>
        <View style={styles.row}>
          <ImageButton
            source={require('../assets/images/token-10.png')}
            text={`10 ${tokenLang}`}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() =>
              navigation.navigate('QRCode', {
                token: '10',
              })
            }
          />
          <ImageButton
            source={require('../assets/images/token-20.png')}
            text={`20 ${tokenLang}`}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() =>
              navigation.navigate('QRCode', {
                token: '20',
              })
            }
          />
          <ImageButton
            source={require('../assets/images/token-30.png')}
            text={`30 ${tokenLang}`}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() =>
              navigation.navigate('QRCode', {
                token: '30',
              })
            }
          />
        </View>
        <View style={styles.row}>
          <ImageButton
            source={require('../assets/images/token-50.png')}
            text={`50 ${tokenLang}`}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() =>
              navigation.navigate('QRCode', {
                token: '50',
              })
            }
          />
          <ImageButton
            source={require('../assets/images/token-100.png')}
            text={`100 ${tokenLang}`}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() =>
              navigation.navigate('QRCode', {
                token: '100',
              })
            }
          />
          <ImageButton
            source={require('../assets/images/token-more.png')}
            text={state.language === CN ? '自定义' : 'Others'}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() => setOpen(true)}
          />
        </View>
      </View>
      {open && <InputModel open={open} close={() => setOpen(false)} />}
    </TimerLayout>
  );
}

const styles = StyleSheet.create({
  colum: {
    alignSelf: 'center',
    gap: calculate(15),
    padding: calculate(5),
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: calculate(5),
  },
  image: {
    width: calculate(110),
    height: calculate(143),
    resizeMode: 'cover',
  },
  tokenText: {
    textAlign: 'center',
    position: 'relative',
    top: calculate(114),
    fontSize: calculate(17),
    fontWeight: 'bold',
  },
});
