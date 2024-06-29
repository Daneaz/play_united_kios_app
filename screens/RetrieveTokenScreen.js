import React, {useContext, useEffect, useState} from 'react';

import BasicLayout from '../components/Layouts/BasicLayout';
import ImageButton from '../components/Button/ImageButton';
import {StyleSheet, View} from 'react-native';
import {GlobalContext} from '../states/GlobalState';
import {CN} from '../constants/Constant';
import InputModel from '../components/Input/InputModel';
import calculate from '../services/DimensionAdapter';

export default function RetrieveTokenScreen({navigation, route}) {
  const [lang, setLang] = useState();
  const [tokenLang, setTokenLang] = useState();
  const [open, setOpen] = useState();

  const [state] = useContext(GlobalContext);

  useEffect(() => {
    setLang(state.language);
    if (state.language === CN) {
      setTokenLang('币');
    } else {
      setTokenLang('Tokens');
    }
  }, [state.language]);

  return (
    <BasicLayout
      source={
        lang === CN
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
                serialCom: route.params.serialCom,
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
                serialCom: route.params.serialCom,
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
                serialCom: route.params.serialCom,
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
                serialCom: route.params.serialCom,
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
                serialCom: route.params.serialCom,
              })
            }
          />
          <ImageButton
            source={require('../assets/images/token-more.png')}
            text={lang === CN ? '自定义' : 'Others'}
            imageBtnStyle={styles.image}
            imageBtnTextStyle={styles.tokenText}
            onPress={() => setOpen(true)}
          />
        </View>
      </View>
      {open && (
        <InputModel
          open={open}
          close={() => setOpen(false)}
          serialCom={route.params.serialCom}
        />
      )}
    </BasicLayout>
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
