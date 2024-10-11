// /components/SomeComponent.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, I18nManager, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { setToken } from '../redux/slices/authSlice';

const Dashboard = ({ navigation, route }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [reloadOnce, setreloadOnce] = useState(0);
    // const isRTL = I18nManager.isRTL;

    // console.log(isRTL);

    useFocusEffect(() => {
        console.log('DashboardTriggered------------useFocusEffect------------------');
        return () => {
            console.log('Dashboard unfocused');
        };
        // if (reloadOnce == 0) {
        //     setScreenFieldsDataApi();
        //     setreloadOnce(1);
        // }
    });
    useEffect(() => {
        console.log('DashboardTriggered------------------------------');


    }, [])

    return (
        <View style={[styles.container, { flexDirection: 'row' }]}>
            {/* <Text style={styles.text}>{t('SAR')}</Text> */}
            {/* <Text style={styles.text}>{'طشسيشسيشس'}</Text> */}
            {/* <LanguageSwitcher></LanguageSwitcher> */}
            <Button title={'Page Refresh'} onPress={() => dispatch(setToken())} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        // Other styles
    },
    text: {
        // textAlign: 'right',
        // Other styles
    },
});

export default Dashboard;
