// /components/DrawerContent.js
import React, { useEffect } from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import { checkSession, logout, resetLoading, setLoading } from '../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';
import colors from '../Utils/colors';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { logoutApi } from '../services/auth';
import LanguageSwitcher from './LanguageSwitcher';

const CustomDrawerContent = (props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.language);

    useEffect(() => {
        console.log('helloCustomDrawer-------------------');

    }, [])

    const logoutFunc = async () => {
        try {
            dispatch(setLoading());
            const lngId = language == 'ar' ? '2' : '1';
            const headers = { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
            const data = await logoutApi({ userId: userProfile?.userId }, headers);
            if (data) {
                dispatch(logout());
                dispatch(resetLoading());

            }
            // console.log(data);
        } catch (error) {
            dispatch(logout());
            dispatch(resetLoading());
            console.log('LogoutError', error);
        }
    }

    const styles = StyleSheet.create({
        languageStyle: {
            position: 'relative',
            opacity: .8,
            backgroundColor: colors.secondary,
            marginHorizontal: 10,
            color: 'white'
        }
    })

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props}
                activeTintColor={'white'}  // Active item text color
                inactiveTintColor={colors.primary} // Inactive item text color
                activeBackgroundColor="yellow"  // Active item background color
            // itemStyle={{ color: 'red' }}
            //  // Custom item styling
            // labelStyle={styles.labelStyle}  // Custom label styling
            />

            <DrawerItem label={t('logout')}
                inactiveTintColor={colors.primary}
                onPress={logoutFunc} />
            <LanguageSwitcher styleProp={styles.languageStyle} />
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
