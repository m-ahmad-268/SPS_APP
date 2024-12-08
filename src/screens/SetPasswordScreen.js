// Example: /screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setLoading, resetLoading, setUserData, checkSession } from '../redux/slices/authSlice';
import colors from '../Utils/colors';
import PasswordField from '../Shared/passwordField';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { setScreenFieldsData, setPasswordApi, getRolesByEmail, getCustomerByEmailApi } from '../services/auth';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetPasswordScreen = ({ navigation, route }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { userId } = route.params || '';
    const currentLanguage = useSelector((state) => state.language.language);
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const [fields, setFields] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-IS-RESET-PASSWORD", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);
            dispatch(resetLoading());
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    }

    useEffect(() => {
        console.log('-------------------------SetPasswor---------------------------', userProfile?.userId);
        dispatch(setLoading());
        setScreenFieldsDataApi();

    }, []);

    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    const validateUser = async () => {
        try {
            const headers = await getHeader();
            const body = {
                email: userProfile?.email,
                customerId: userProfile?.customerNo,
            }
            dispatch(setLoading());
            const response = await getRolesByEmail(body, headers);
            if (response.code == 200) {
                const roles = JSON.stringify(response.result.roles);
                await AsyncStorage.setItem('sidebar', roles);
                await AsyncStorage.setItem('email', response.result.customerEmail);

                const data = await getCustomerByEmailApi({ 'email': response.result.customerEmail }, headers);
                console.log(data);
                if (data.code === 200) {
                    if (!data.result.allowOnlinePortal || data.code === 400) {


                        console.log('Swalll wala portion--------');

                        // swal.fire({
                        //     'title': Constants.confirmationText.toString(),
                        //     'text': Constants.USER_IS_NOT_ALLOWED_FOR_PORTAL,
                        //     'icon': 'warning',
                        //     'showCancelButton': true,
                        //     'confirmButtonText': Constants.LOGOUT,
                        //     'cancelButtonText': Constants.btnCancelText,
                        //     'allowOutsideClick': false,
                        //     'allowEscapeKey': false,
                        // }).then((result) => {
                        //     if (result.value) {
                        //         this.logOut();
                        //     } else {
                        //         Utils.showLoader('.pageheader');
                        //     }
                        // });
                    } else {
                        const siteId = data.result.siteId != undefined || data.result.siteId != null ? data.result.siteId : null;
                        const customerId = data.result.customerId != undefined || data.result.customerId != null ? data.result.customerId : null;
                        const priceLevelId = !!data.result.priceLevel ? data.result.priceLevel : '';
                        AsyncStorage.setItem('showFavItems', 'false');
                        await AsyncStorage.setItem('currentUser', JSON.stringify({ userId: userProfile.userId, session: userProfile.session }));
                        dispatch(setUserData({ siteId: siteId, priceLevel: priceLevelId, customerId: customerId }))
                        if (!!response.result.roles[0].path) {
                            console.log(response.result.roles[0].path);
                            dispatch(checkSession());
                            // this.router.navigate([response.result.roles[0].path]);
                        }
                    }
                } else if (data.code === 400) {
                    dispatch(setLoading());
                    console.log(' this.logOutPopUp();121212');
                    // this.logOutPopUp();
                }
            } else {
                dispatch(setLoading());
                console.log(' this.logOutPopUp();');
                // this.logOutPopUp();
            }
        } catch (error) {
            console.log('validateUser', error);
            dispatch(resetLoading());

        }
    }


    const resetPassword = async () => {

        try {
            if (!password || !confirmPassword) {
                setErrorMsg(t('requiredValid'));
                return;
            }
            setErrorMsg('');

            if (password == confirmPassword) {
                dispatch(setLoading());
                const body = {
                    userId: userProfile.userId,
                    password: password
                };
                const header = await getHeader();
                const data = await setPasswordApi(body, header);
                if (data.code == 200 || data.code == 201) {
                    validateUser();
                    // this.logOut();
                } else {
                    dispatch(logout());
                    navigation?.replace('Login');
                }
                console.log(data);
                const msg = data?.code == 200 || data?.code == 201 ? 'success' : 'error';
                Toast.show({
                    type: msg, // 'error', 'info' can also be used
                    text1: data.btiMessage?.message || t(msg),
                    text2: t(msg) + '!',
                });
                dispatch(resetLoading());
            } else {
                Toast.show({
                    type: 'error', // 'error', 'info' can also be used
                    text1: 'Password Mismatch!' || t('error'),
                    text2: t('error') + '!',
                });
            }

        } catch (error) {
            Toast.show({
                type: 'error', // 'error', 'info' can also be used
                text1: t('serverErrorText') || t('error'),
                text2: t('error') + '!',
            });
            dispatch(resetLoading());
        }

    }

    return (
        <ScrollView style={styles.container}>
            <LanguageSwitcher styleProp={{ top: 50, right: 0, }} />
            {fields && <View style={{ marginVertical: 180, }}>
                <Text style={{ fontSize: 35, fontWeight: 'bold', marginVertical: 50, textAlign: 'center', color: 'black' }}>{fields?.['RESET_PASSWORD']?.fieldValue || 'Reset Password'}</Text>
                <PasswordField
                    value={password}
                    onChangeText={setPassword}
                    placeholder={fields?.['NEW_PASSWORD']?.fieldValue || 'New Password'}
                />
                <PasswordField
                    value={confirmPassword}
                    style={{ marginVertical: 10 }}
                    onChangeText={setConfirmPassword}
                    placeholder={fields?.['CONFIRM_PASSWORD']?.fieldValue || 'Confirm Password'}
                />
                {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
                <TouchableOpacity style={[styles.input, isLoading ? { backgroundColor: 'lightgrey' } : { backgroundColor: 'black' }]}
                    disabled={isLoading} onPress={resetPassword}
                >
                    <Text style={{ color: colors.white, textAlign: 'center', fontSize: 20 }}>{t('submit')}</Text>
                </TouchableOpacity>
            </View>}
        </ScrollView >

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: colors.primary,
    },
    input: {
        borderWidth: 1,
        borderRadius: 30,
        marginVertical: 20,
        padding: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default SetPasswordScreen;
