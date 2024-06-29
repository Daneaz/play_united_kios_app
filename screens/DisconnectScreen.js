import React, {useContext} from 'react';

import {ImageBackground, StatusBar, StyleSheet, View} from 'react-native';
import {CN} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import {GlobalContext} from '../states/GlobalState';
import TextEnricher from '../components/Label/TextEnricher';
import TextEnrichImageButton from '../components/Label/TextEnrichImageButton';

export default function DisconnectScreen({navigation}) {
  const [state, dispatch] = useContext(GlobalContext);

  return (
    <View alignItems="center">
      <StatusBar hidden={true} />
      <ImageBackground
        source={require('../assets/images/disconnected.png')}
        resizeMode="stretch"
        style={styles.image}
      />

      <View alignItems="center" space={calculate(5)}>
        <TextEnricher style={styles.text}>
          {state.language === CN ? '连接中断' : 'Disconnected'}
        </TextEnricher>

        <TextEnrichImageButton
          source={require('../assets/images/msg-dialog-btn-red.png')}
          imageBtnStyle={styles.btn}
          text={state.language === CN ? '重试' : 'Retry'}
          imageBtnTextStyle={styles.btnText}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: calculate(367),
    height: calculate(399),
    marginBottom: calculate(15),
  },
  text: {
    fontSize: calculate(30),
    alignSelf: 'center',
  },
  btn: {
    width: calculate(150),
    height: calculate(35),
  },
  btnText: {
    paddingTop: calculate(5),
    fontSize: calculate(16),
    alignSelf: 'center',
    color: 'white',
    textShadowColor: '#FF347B',
  },
});
