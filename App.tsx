// App.js
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { persistor } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, AppState, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';


import Toast from 'react-native-toast-message';
import colors from './src/Utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Ensure i18n is initialized
// import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {

  AsyncStorage.getItem('persist:root').then((data) => {
    console.log('Persisted data:', data); // Check if your token is stored correctly
  });


  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <PaperProvider>
          <SafeAreaView style={{ backgroundColor: colors.primary, flex: 1 }}>
            <NavigationContainer>
              <MainApp />
            </NavigationContainer>
            <Toast />
          </SafeAreaView>
        </PaperProvider>
      </PersistGate>
    </Provider >
  );
};

const MainApp = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(resetLoading());
    const initializeLanguage = async () => {
      // Language is already persisted by redux-persist
      // Additional initialization if needed
    };

    console.log('FirstEntrancesokay------------------------');

    initializeLanguage();
  }, []);

  return <RootNavigator />;
};

const Loading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
    {/* <ActivityIndicator size="small" /> */}
    <Image style={{ width: 150, height: 150 }}
      source={require('./src/assets/images/logo.png')}
      resizeMode="contain"
    />
  </View>
);

export default App;
