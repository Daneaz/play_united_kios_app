import React, {useContext, useEffect, useState} from 'react';

import PurchaseBanner from '../components/PurchaseBanner';
import {ScrollView, StyleSheet} from 'react-native';
import TimerLayout from '../components/Layouts/TimerLayout';
import {fetchAPI} from '../services/Utility';
import MessageDialog from '../components/MessageDialog';
import {GlobalContext} from '../states/GlobalState';
import {CN} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';

export default function PurchaseScreen({navigation}) {
  const [promotionList, setPromotionList] = React.useState(null);
  const [msg, setMsg] = useState(null);

  const [state] = useContext(GlobalContext);

  useEffect(() => {
    getPromotionList();
  }, []);

  function getPromotionList() {
    fetchAPI('GET', 'promotionMgt/getPromotionList')
      .then(promotion => {
        setPromotionList(promotion);
      })
      .catch(error => {
        setTimeout(() => {
          setMsg(error);
        }, 1000);
      });
  }

  return (
    <TimerLayout
      source={
        state.language === CN
          ? require('../assets/images/purchase-bg-cn.png')
          : require('../assets/images/purchase-bg-en.png')
      }
      text={state.time}
      clearTimer={true}>
      <ScrollView
        style={styles.banner}
        persistentScrollbar={true}
        contentContainerStyle={{alignItems: 'center', gap: calculate(10)}}>
        {promotionList &&
          promotionList.map(promotion => {
            return (
              <PurchaseBanner
                key={promotion._id}
                promotion={promotion}
                navigation={navigation}
              />
            );
          })}
      </ScrollView>
      <MessageDialog type={'INFO'} msg={msg} close={() => setMsg(null)} />
    </TimerLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    flex: 1,
    maxHeight: '40%',
    margin: calculate(10),
  },
});
