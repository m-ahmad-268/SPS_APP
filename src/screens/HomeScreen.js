// /screens/SettingsScreen.js
import React, { useCallback, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { setToken } from '../redux/slices/authSlice';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
    const dispatch = useDispatch();
    const { i18n } = useTranslation();
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);


    useFocusEffect(
        useCallback(() => {
            console.log('HomescreenTriggered------------useFocusEffect------------------');

            // Add logic for focus actions if necessary
            return () => {
                console.log('--------------------------------------HomescreenTriggered unfocused');
                dispatch(setToken()); // Clean-up or reset logic
            };
        }, [userProfile])
    );

    useEffect(() => {
        console.log('-------------------------HomeScreen Entrances-----------------', currentLanguage);

    }, []);

    // const logoutFunc = async () => {

    //     try {
    //         dispatch(setLoading());
    //         const getData = await AsyncStorage.getItem('currentUser');
    //         const userData = JSON.parse(getData);
    //         // console.log('heloLogout', userData.userId);
    //         const lngId = isRTL ? '2' : '1';
    //         const tenantid = await AsyncStorage.getItem('tenantid') || {};
    //         const headers = { langid: lngId, userid: userData.userId, session: userData.session, tenantid: tenantid }
    //         const data = await logoutApi({ userId: userData.userId }, headers)
    //         // console.log(data);
    //         dispatch(logout());
    //     } catch (error) {
    //         console.log('LogoutError', error);
    //         dispatch(resetLoading());
    //     }
    // };

    return (
        <View style={styles.container}>
            <Button title="Switch to English" onPress={() => switchLanguage('en')} disabled={currentLanguage === 'en'} />
            <Button title="Switch to Arabic" onPress={() => switchLanguage('ar')} disabled={currentLanguage === 'ar'} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
});

export default HomeScreen;
