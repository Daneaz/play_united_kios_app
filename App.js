/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {ThemeContext} from './components/Base/ThemeContext';
import * as eva from '@eva-design/eva';
import {useColorScheme} from 'react-native';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PurchaseScreen from './screens/PurchaseScreen';
import RetrieveTokenScreen from './screens/RetrieveTokenScreen';
import QRCodeScreen from './screens/QRCodeScreen';
import FOMOPayScreen from './screens/FOMOPayScreen';
import DisconnectScreen from './screens/DisconnectScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ApplicationProvider} from '@ui-kitten/components';
import {GlobalContextProvider} from './states/GlobalState';

const AuthStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator headerMode="none">
      <AuthStack.Screen
        name="LogIn"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Purchase"
        component={PurchaseScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="RetrieveToken"
        component={RetrieveTokenScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="QRCode"
        component={QRCodeScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="FOMOPay"
        component={FOMOPayScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Disconnected"
        component={DisconnectScreen}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
}

function App() {
  let colorScheme = useColorScheme();
  const [theme, setTheme] = React.useState(colorScheme);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{theme, toggleTheme}}>
      <ApplicationProvider {...eva} theme={eva[theme]}>
        <GlobalContextProvider>
          <NavigationContainer>
            <AuthStackScreen />
          </NavigationContainer>
        </GlobalContextProvider>
      </ApplicationProvider>
    </ThemeContext.Provider>
  );
}

export default App;
