import React, {useEffect, useState} from 'react';
import {Input, Layout, Text} from '@ui-kitten/components';
import {Formik} from 'formik';
import InputLayout from '../components/Layouts/InputLayout';
import {fetchAPI, getData, removeData, storeData} from '../services/Utility';
import {GlobalStyles} from '../constants/GlobalStyles';
import {loginSchema} from '../constants/Validations';
import ButtonSpinner from '../components/Button/ButtonSpinner';
import {ENV} from '@env';
import * as Constant from '../constants/Constant';
import {useIsFocused} from '@react-navigation/native';
import MessageDialog from '../components/MessageDialog';

export default function LoginScreen({navigation}) {
  const [msg, setMsg] = useState(null);
  const isFocused = useIsFocused();
  useEffect(() => {
    async function getUser() {
      let user = await getData(Constant.USER);
      if (user !== null && user.role.name === Constant.MACHINE) {
        navigation.navigate('Home');
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    checkForUpdate();
  }, [isFocused]);

  function checkForUpdate() {
    // codePush.sync({
    //   updateDialog: true,
    //   installMode: codePush.InstallMode.IMMEDIATE,
    // });
  }

  function onLogin(values, actions) {
    fetchAPI('POST', 'authMgt/auth', values)
      .then(async respObj => {
        await storeData(Constant.TOKEN, respObj.token);
        await storeData(Constant.USER, JSON.stringify(respObj.user));
        actions.setSubmitting(false);
        navigation.push('Home');
      })
      .catch(error => {
        console.log('LoginScreen onLogin  err: ', error);
        setTimeout(async () => {
          actions.setSubmitting(false);
          await removeData(Constant.USER);
          await removeData(Constant.TOKEN);
          setMsg(error);
        }, 1000);
      });
  }

  return (
    <InputLayout>
      <Formik
        initialValues={{mobile: '', password: ''}}
        onSubmit={onLogin}
        validationSchema={loginSchema}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          touched,
          errors,
          isSubmitting,
        }) => (
          <Layout style={GlobalStyles.inputContainer}>
            <Input
              label={'Mobile'}
              keyboardType={'number-pad'}
              onBlur={handleBlur('mobile')}
              placeholder="Enter mobile number..."
              onChangeText={handleChange('mobile')}
              value={values.mobile}
            />
            {touched.mobile && errors.mobile && (
              <Text style={GlobalStyles.errorText}>
                {touched.mobile && errors.mobile}
              </Text>
            )}
            <Input
              label={'Password'}
              type={'password'}
              onBlur={handleBlur('password')}
              placeholder="Enter password..."
              onChangeText={handleChange('password')}
              value={values.password}
              onSubmitEditing={handleSubmit}
              secureTextEntry={true}
            />
            {touched.password && errors.password && (
              <Text style={GlobalStyles.errorText}>
                {touched.password && errors.password}
              </Text>
            )}
            <ButtonSpinner isSubmitting={isSubmitting} onPress={handleSubmit}>
              Login
            </ButtonSpinner>
            <Layout style={GlobalStyles.rowCenterContent}>
              <Text>No Account ? </Text>
              <Text status={'info'} onPress={() => navigation.push('SignUp')}>
                Sign Up
              </Text>
            </Layout>
            <Layout style={GlobalStyles.rowCenterContent}>
              <Text
                status={'info'}
                onPress={() => navigation.push('ResetPassword')}>
                Forget Password?
              </Text>
            </Layout>
            <Layout style={GlobalStyles.rowCenterContent}>
              <Text style={GlobalStyles.smallText}>
                {`${ENV} Build Version: 20250104`}
              </Text>
            </Layout>
          </Layout>
        )}
      </Formik>
      <MessageDialog type={'ERROR'} msg={msg} close={() => setMsg(null)} />
    </InputLayout>
  );
}
