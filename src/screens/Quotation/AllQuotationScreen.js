// /screens/SettingsScreen.js
import React, { useCallback, useEffect } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { setToken } from '../../redux/slices/authSlice';

const AllQuotationScreen = () => {
    const dispatch = useDispatch();
    const { i18n } = useTranslation();
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);


    useFocusEffect(
        useCallback(() => {
            console.log('AllQuotationScreenTriggered------------useFocusEffect------------------');

            // Add logic for focus actions if necessary
            return () => {
                console.log('--------------------------------------AllQuotationScreenTriggered unfocused');
                dispatch(setToken()); // Clean-up or reset logic
            };
        }, [userProfile])
    );

    useEffect(() => {
        console.log('-------------------------AllQuotationScreen Entrances-----------------', currentLanguage);

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
        <ScrollView style={styles.container}>
            <Text style={styles.title} >Hello Quotation Screen</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'aqua',
        // justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        backgroundColor: 'red',
    },
});

export default AllQuotationScreen;
