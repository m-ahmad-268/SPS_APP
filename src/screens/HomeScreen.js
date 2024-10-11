// Example: /screens/HomeScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setLoading, resetLoading, setToken } from '../redux/slices/authSlice';
import { logoutApi } from '../services/auth.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
    // const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const isRTL = I18nManager.isRTL;


    useFocusEffect(() => {
        console.log('HomescreenTriggered------------useFocusEffect------------------');
        // dispatch(setToken());
        // if (reloadOnce == 0) {
        //     setScreenFieldsDataApi();
        //     setreloadOnce(1);
        // }
        return () => {
            console.log('Homescreen unfocused');
        };
    });


    useEffect(() => {
        console.log('Homescreen Entrances-----------------', isAuthenticated);
        dispatch(resetLoading());


    }, [])

    const logoutFunc = async () => {

        try {
            dispatch(setLoading());
            const getData = await AsyncStorage.getItem('currentUser');
            const userData = JSON.parse(getData);
            // console.log('heloLogout', userData.userId);
            const lngId = isRTL ? '2' : '1';
            const tenantid = await AsyncStorage.getItem('tenantid') || {};
            const headers = { langid: lngId, userid: userData.userId, session: userData.session, tenantid: tenantid }
            const data = await logoutApi({ userId: userData.userId }, headers)
            // console.log(data);
            dispatch(logout());
        } catch (error) {
            console.log('LogoutError', error);
            dispatch(resetLoading());
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{'welcome'}</Text>
            <Button title={'Logout'} onPress={logoutFunc} />
            {/* Add more UI elements */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
