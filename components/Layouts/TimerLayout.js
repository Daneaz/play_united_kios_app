import React, {useContext, useEffect} from 'react';

import {ImageBackground, StatusBar, StyleSheet, Text, View} from 'react-native';
import ImageButton from '../Button/ImageButton';
import {useNavigation} from '@react-navigation/native';
import {GlobalContext} from '../../states/GlobalState';
import {RESET} from '../../constants/Constant';
import calculate from '../../services/DimensionAdapter';

export default function TimerLayout(props) {
  const navigation = useNavigation();
  const [state, dispatch] = useContext(GlobalContext);

  useEffect(() => {
    if (state.time <= 0) {
      dispatch({type: RESET});
      navigation.navigate('Home');
    }
  }, [dispatch, navigation, state.time]);

  return (
    <View>
      <StatusBar hidden={true} />
      <View>
        <ImageBackground source={props.source} style={styles.image}>
          <ImageButton
            imageBtnStyle={styles.backBtn}
            source={require('../../assets/images/backBtn.png')}
            onPress={() => {
              if (props.clearTimer) {
                dispatch({type: RESET});
              }
              navigation.goBack();
            }}
          />
        </ImageBackground>
      </View>
      <View style={styles.whiteBg}>
        <View style={styles.timerPosition}>
          <ImageBackground
            source={require('../../assets/images/timer.png')}
            style={styles.timer}>
            <Text style={styles.timerText}>{`${props.text}s`}</Text>
          </ImageBackground>
        </View>
        {props.children}
        <View style={styles.homePosition}>
          <ImageButton
            source={require('../../assets/images/home.png')}
            imageBtnStyle={styles.homeBtn}
            onPress={() => {
              dispatch({type: RESET});
              navigation.navigate('Home');
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: calculate(160),
  },
  whiteBg: {
    width: '100%',
    height: '100%',
  },
  timerPosition: {
    marginTop: calculate(5),
    marginRight: calculate(10),
    alignItems: 'flex-end',
  },
  timer: {
    margin: calculate(10),
    width: calculate(87),
    height: calculate(37),
    resizeMode: 'stretch',
  },
  timerText: {
    textAlign: 'center',
    paddingTop: calculate(5),
    fontWeight: 'bold',
    fontSize: calculate(20),
    color: 'white',
  },
  homePosition: {
    position: 'absolute',
    right: '42%',
    bottom: '43%',
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
});
