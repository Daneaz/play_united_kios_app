import React from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {Layout, TopNavigation} from '@ui-kitten/components';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
});

//alight all items in the center of the screen
export default function ScrollViewLayout(props) {
  return (
    <Layout style={styles.container}>
      <StatusBar />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          {(props.right || props.left || props.title) && (
            <TopNavigation
              title={props.title}
              accessoryRight={props.right}
              accessoryLeft={props.left}
            />
          )}
          {/*Different between ScrollViewLayout and ReportViewLayout, justifyContent center so Input will be at the top instead of center of screen*/}
          <ScrollView
            contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
            {props.children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Layout>
  );
}
