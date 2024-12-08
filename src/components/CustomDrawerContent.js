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
import { useFocusEffect, useNavigationState } from '@react-navigation/native';

const CustomDrawerContent = (props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.language);
    const navigationState = props.navigation.getState();
    let activeRouteName = '';

    if (navigationState?.routes) {
        const nestedState = navigationState.routes.find(route => route.state)?.state;
        if (nestedState) {
            // Get the active route from the nested stack navigator
            const activeIndex = nestedState.index;
            activeRouteName = nestedState.routes[activeIndex].name;
        } else {
            // Fallback if there is no nested state
            activeRouteName = navigationState.routes[navigationState.index].name;
        }
    }
    const isActiveRoute = (routeName) => activeRouteName === routeName;

    useFocusEffect(() => {
        // console.log('helloCustomDrawer-------------------');

        // Function to determine if a route is active
        // const isActiveRoute = (routeName) => activeRouteName === routeName;
        // console.log('roiutee',isActiveRoute);

    })

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
        <DrawerContentScrollView {...props} style={{ marginVertical: 20 }}>
            {/* <DrawerItemList {...props}
                activeTintColor={'white'}  // Active item text color
                inactiveTintColor={colors.primary} // Inactive item text color
                activeBackgroundColor="yellow"  // Active item background color
            /> */}
            <DrawerItem label={props.fields?.['DASHBOARD']?.fieldValue || 'Dashboard'}
                labelStyle={[isActiveRoute('dashboard') ? { color: colors.secondary } : { color: colors.primary }]}
                onPress={() => props.navigation.navigate('dashboard')} />
            <DrawerItem label={props.fields?.['PROFILE_INFORMATION']?.fieldValue || 'Profile Information'}
                labelStyle={[isActiveRoute('profile') ? { color: colors.secondary } : { color: colors.primary }]}
                onPress={() => props.navigation.navigate('profile')} />
            <DrawerItem label={t('quotation')}
                labelStyle={[isActiveRoute('AllQuotationScreen') ? { color: colors.secondary } : { color: colors.primary }]}
                onPress={() => props.navigation.navigate('AllQuotationScreen')} />
            <DrawerItem label={t('order')}
                labelStyle={[isActiveRoute('AllOrderScreen') ? { color: colors.secondary } : { color: colors.primary }]}
                onPress={() => props.navigation.navigate('AllOrderScreen')} />
            <DrawerItem label={t('invoices')}
                labelStyle={[isActiveRoute('AllInvoicesScreen') ? { color: colors.secondary } : { color: colors.primary }]}
                onPress={() => props.navigation.navigate('AllInvoicesScreen')} />
            <LanguageSwitcher styleProp={styles.languageStyle} />
            <DrawerItem label={t('logout')}
                labelStyle={[isActiveRoute('logout') ? { color: colors.secondary } : { color: colors.primary }]}
                onPress={logoutFunc} />
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
