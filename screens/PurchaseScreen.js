import React, {useContext, useEffect, useState} from 'react';

import PurchaseBanner from '../components/PurchaseBanner';
import {StyleSheet, View, ScrollView} from 'react-native';
import BasicLayout from '../components/Layouts/BasicLayout';
import {fetchAPI} from '../services/Utility';
import MessageDialog from '../components/MessageDialog';
import {GlobalContext} from '../states/GlobalState';
import {CN} from '../constants/Constant';
import calculate from '../services/DimensionAdapter';

export default function PurchaseScreen({navigation}) {
  const [promotionList, setPromotionList] = React.useState(null);
  const [msg, setMsg] = useState(null);
  const [lang, setLang] = useState();

  const [state] = useContext(GlobalContext);

  useEffect(() => {
    setLang(state.language);
  }, [state.language]);

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
    <BasicLayout
      source={
        lang === CN
          ? require('../assets/images/purchase-bg-cn.png')
          : require('../assets/images/purchase-bg-en.png')
      }
      text={state.time}
      clearTimer={true}>
      <ScrollView>
        <View style={styles.banner}>
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
        </View>
      </ScrollView>
      <MessageDialog type={'INFO'} msg={msg} close={() => setMsg(null)} />
    </BasicLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    gap: calculate(10),
  },
});
