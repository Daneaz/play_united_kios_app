import React, {useContext} from 'react';
import {Image, ImageBackground, StyleSheet, Text, View} from 'react-native';
import ImageButton from './Button/ImageButton';
import {useNavigation} from '@react-navigation/native';
import {MESSAGE_RECEIVED, RESET} from '../constants/Constant';
import {GlobalContext} from '../states/GlobalState';
import calculate from '../services/DimensionAdapter';
import TextEnricher from './Label/TextEnricher';
import TextEnrichImageButton from './Label/TextEnrichImageButton';
import {Modal} from '@ui-kitten/components';

export default function MessageDialog(props) {
  const navigation = useNavigation();

  const [state, dispatch] = useContext(GlobalContext);

  function MsgRouter() {
    switch (props.type) {
      case 'INFO':
        return Info();
      case 'WARNING':
        return Warning();
      case 'ERROR':
        return Error();
      case 'SUCCESS':
        return Success();
    }
  }

  function Info() {
    return (
      <ImageBackground
        source={require('../assets/images/msg-dialog-holder.png')}
        style={common.common}>
        <ImageButton
          source={require('../assets/images/msg-dialog-close-blue.png')}
          imageBtnStyle={common.close}
          onPress={props.close}
        />
        <ImageBackground
          source={require('../assets/images/msg-dialog-blue.png')}
          style={common.title}>
          <TextEnricher style={common.infoText}>
            {props.header ? props.header : 'Info'}
          </TextEnricher>
        </ImageBackground>
        <View space={1} alignItems={'center'}>
          <Image
            source={require('../assets/images/msg-dialog-info.png')}
            style={common.icon}
            alt={'Image not found'}
          />
          <Text style={common.msgText}>{props.msg}</Text>
          <TextEnrichImageButton
            source={require('../assets/images/msg-dialog-btn-blue.png')}
            imageBtnStyle={common.btn}
            text={props.btnText ? props.btnText : 'Ok'}
            imageBtnTextStyle={common.infoText}
            onPress={() => onConfirm()}
          />
        </View>
      </ImageBackground>
    );
  }

  function Warning() {
    return (
      <ImageBackground
        source={require('../assets/images/msg-dialog-holder.png')}
        style={common.common}>
        <ImageButton
          source={require('../assets/images/msg-dialog-close-blue.png')}
          imageBtnStyle={common.close}
          onPress={props.close}
        />
        <ImageBackground
          source={require('../assets/images/msg-dialog-yellow.png')}
          style={common.title}>
          <TextEnricher style={common.warningText}>
            {props.header ? props.header : 'Warning'}
          </TextEnricher>
        </ImageBackground>
        <View space={1} alignItems={'center'}>
          <Image
            source={require('../assets/images/msg-dialog-warning.png')}
            style={common.icon}
            alt={'Image not found'}
          />
          <Text style={common.msgText}>{props.msg}</Text>
          <TextEnrichImageButton
            source={require('../assets/images/msg-dialog-btn-yellow.png')}
            imageBtnStyle={common.btn}
            text={props.btnText ? props.btnText : 'Ok'}
            imageBtnTextStyle={common.warningText}
            onPress={() => onConfirm()}
          />
        </View>
      </ImageBackground>
    );
  }

  function Error() {
    return (
      <ImageBackground
        source={require('../assets/images/msg-dialog-holder.png')}
        style={common.common}>
        <ImageButton
          source={require('../assets/images/msg-dialog-close-blue.png')}
          imageBtnStyle={common.close}
          onPress={props.close}
        />
        <ImageBackground
          source={require('../assets/images/msg-dialog-red.png')}
          style={common.title}>
          <TextEnricher style={common.errorText}>
            {props.header ? props.header : 'Error'}
          </TextEnricher>
        </ImageBackground>
        <View alignItems={'center'}>
          <Image
            source={require('../assets/images/msg-dialog-error.png')}
            style={common.icon}
            alt={'Image not found'}
          />
          <Text style={common.msgText}>{formatMessage(props.msg)}</Text>
          <TextEnrichImageButton
            source={require('../assets/images/msg-dialog-btn-red.png')}
            imageBtnStyle={common.btn}
            text={props.btnText ? props.btnText : 'Ok'}
            imageBtnTextStyle={common.errorText}
            onPress={() => onConfirm()}
          />
        </View>
      </ImageBackground>
    );
  }

  function Success() {
    return (
      <ImageBackground
        source={require('../assets/images/msg-dialog-holder.png')}
        style={success.successHolder}>
        <ImageButton
          source={require('../assets/images/msg-dialog-close-blue.png')}
          imageBtnStyle={success.close}
          onPress={() => {
            props.close();
            dispatch({type: RESET});
            navigation.navigate('Home');
          }}
        />
        <ImageBackground
          source={require('../assets/images/msg-dialog-green.png')}
          style={success.title}>
          <TextEnricher style={success.titleText}>
            {props.header ? props.header : 'Success'}
          </TextEnricher>
        </ImageBackground>
        <View space={1} alignItems={'center'}>
          <Image
            source={require('../assets/images/msg-dialog-success.png')}
            style={success.icon}
            alt={'Image not found'}
          />
          <Text style={success.msgText}>{props.msg}</Text>
          <TextEnrichImageButton
            source={require('../assets/images/msg-dialog-btn-green.png')}
            imageBtnStyle={success.btn}
            text={props.btnText ? props.btnText : 'Ok'}
            imageBtnTextStyle={common.infoText}
            onPress={() => {
              props.close();
              dispatch({type: RESET});
              navigation.navigate('Home');
            }}
          />
        </View>
      </ImageBackground>
    );
  }

  function formatMessage(msg) {
    if (msg === null) {
      return;
    } else if (typeof msg === 'object' && msg.message) {
      return msg.message;
    } else if (typeof msg === 'string') {
      return msg;
    }
    return 'Unknown message'; // 处理其他情况
  }

  function onConfirm() {
    //clear the msg, before entering the next screen
    dispatch({type: MESSAGE_RECEIVED, payload: ''});
    if (props.onConfirm) {
      props.close();
      props.onConfirm();
    } else {
      props.close();
    }
  }

  return (
    <Modal visible={!!props.msg} onClose={props.close}>
      {MsgRouter()}
    </Modal>
  );
}

const common = StyleSheet.create({
  common: {
    width: calculate(315),
    height: calculate(315),
  },
  title: {
    alignSelf: 'center',
    width: calculate(149),
    height: calculate(49),
  },
  close: {
    position: 'absolute',
    top: calculate(15),
    right: calculate(10),
    width: calculate(25),
    height: calculate(25),
  },
  infoText: {
    margin: calculate(6),
    fontSize: calculate(20),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: '#3385FF',
  },
  warningText: {
    margin: calculate(6),
    fontSize: calculate(20),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: '#FFD138',
  },
  errorText: {
    margin: calculate(6),
    fontSize: calculate(20),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: '#FF347B',
  },
  icon: {
    width: calculate(140),
    height: calculate(140),
    alignSelf: 'center',
  },
  msgText: {
    textAlign: 'center',
    marginBottom: calculate(10),
    maxWidth: calculate(250),
    fontSize: calculate(15),
  },
  btn: {
    width: calculate(178),
    height: calculate(44),
  },
});

const success = StyleSheet.create({
  successHolder: {
    width: calculate(315),
    height: calculate(315),
  },
  title: {
    alignSelf: 'center',
    width: calculate(149),
    height: calculate(49),
  },
  close: {
    position: 'absolute',
    top: calculate(90),
    right: calculate(20),
    width: calculate(25),
    height: calculate(25),
  },
  titleText: {
    margin: calculate(5),
    fontSize: calculate(20),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: '#0C9E7E',
  },
  icon: {
    width: calculate(140),
    height: calculate(140),
    alignSelf: 'center',
    top: calculate(60),
  },
  msgText: {
    textAlign: 'center',
    top: calculate(38),
    marginBottom: calculate(5),
    maxWidth: calculate(250),
    fontSize: calculate(15),
  },
  btn: {
    width: calculate(178),
    height: calculate(44),
    top: calculate(50),
  },
});
