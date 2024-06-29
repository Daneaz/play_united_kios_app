import React from 'react';

import {Dimensions, Image} from 'react-native';
import {Layout} from '@ui-kitten/components';
import ScrollViewLayout from './ScrollViewLayout';

//alight all items in the center of the screen, same as ScrollViewLayout
//but with an additional image
export default function InputLayout(props) {
  return (
    <ScrollViewLayout right={props.right} left={props.left} title={props.title}>
      <Layout style={{margin: '5%'}}>
        <Image
          style={{
            width: Dimensions.get('window').width * 0.7,
            height: Dimensions.get('window').width * 0.2,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
          source={require('../../assets/images/font.png')}
        />
        {props.children}
      </Layout>
    </ScrollViewLayout>
  );
}
