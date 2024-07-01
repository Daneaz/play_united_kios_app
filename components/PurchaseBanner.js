import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {fetchAPI} from '../services/Utility';
import {GlobalContext} from '../states/GlobalState';
import {CN} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';
import Colors from '../constants/Colors';
import MessageDialog from './MessageDialog';

export default function PurchaseBanner(props) {
  const [tokenLang, setTokenLang] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState(null);
  const [header, setHeader] = useState(null);
  const [btnText, setBtnText] = useState(null);

  const [state] = useContext(GlobalContext);

  useEffect(() => {
    if (state.language === CN) {
      setTokenLang('币');
    } else {
      setTokenLang('Tokens');
    }
  }, [state.language]);

  const promotion = props.promotion;

  async function handleCheckout() {
    let order = await fetchAPI('POST', 'orderMgt/newOrder', promotion);
    props.navigation.navigate('FOMOPay', {url: order});
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.5}
        onPress={() => {
          setType('INFO');
          setHeader('Purchasing');
          setBtnText('Confirm?');
          setMsg(
            `Token: ${promotion.tokens} \n Amount: $${promotion.sellingPrice}`,
          );
        }}>
        <ImageBackground
          source={require('../assets/images/purchase-bg-holder.png')}
          style={styles.banner}>
          <View>
            <ImageBackground
              source={require('../assets/images/promotion-title-holder.png')}
              style={styles.promotionTitle}>
              <Image
                source={require('../assets/images/minigame-icon.png')}
                style={styles.miniGame}
                alt={'Image not found'}
              />
              <Text style={styles.promotionTitleText}>{promotion.name}</Text>
            </ImageBackground>
            <View style={styles.row}>
              <Image
                source={require('../assets/images/purchase-icon.png')}
                style={styles.icon}
                alt={'Image not found'}
              />
              <Text
                style={styles.text}>{`${promotion.tokens} ${tokenLang}`}</Text>
              <View style={styles.box}>
                <Text
                  style={
                    styles.textMoney
                  }>{`SGD ${promotion.sellingPrice}`}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <MessageDialog
        type={type}
        msg={msg}
        header={header}
        btnText={btnText}
        close={() => setMsg(null)}
        onConfirm={() => handleCheckout()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: calculate(10),
  },
  banner: {
    width: calculate(326),
    height: calculate(76),
    borderRadius: calculate(20),
    resizeMode: 'cover',
  },
  icon: {
    width: calculate(28),
    height: calculate(28),
  },
  promotionTitle: {
    flexDirection: 'row',
    maxWidth: calculate(350),
    minWidth: calculate(111),
    height: calculate(20),
    alignSelf: 'flex-end',
    resizeMode: 'contain',
  },
  miniGame: {
    margin: calculate(2),
    width: calculate(17),
    height: calculate(14),
  },
  promotionTitleText: {
    margin: calculate(2),
    fontWeight: 'bold',
    fontSize: calculate(10),
    color: 'white',
  },
  text: {
    paddingLeft: calculate(10),
    fontWeight: 'bold',
    fontSize: calculate(20),
    color: 'white',
  },
  textMoney: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: calculate(17),
    color: 'orange',
    paddingTop: calculate(3),
  },
  box: {
    position: 'absolute',
    right: calculate(5),
    borderRadius: calculate(7),
    shadowRadius: calculate(5),
    shadowOpacity: calculate(10),
    width: calculate(80),
    height: calculate(30),
    backgroundColor: 'white',
  },
  backdrop: {
    backgroundColor: Colors.transparent,
  },
});
