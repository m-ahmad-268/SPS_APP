// /screens/LoginScreen.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Button, TouchableOpacity, I18nManager } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, resetLoading, setLoading, setToken, setUserData } from '../redux/slices/authSlice';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { i18n } from '../i18n';
import Toast from 'react-native-toast-message';
import { loginUserForOtp, verifyOtpAuthentication, setScreenFieldsData, companyListByUserId, checkCompanyAccess, getRolesByEmail, getCustomerByEmailApi } from '../services/auth';
// import { showToast } from '../Utils/toast.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateEmail, validatePassword } from '../Utils/validattion';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../Utils/colors';
// import Icon from 'react-native-vector-icons/Ionicons'; 
// Arrow Icon

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoader, setIsLoader] = useState(false);
    const [fields, setFields] = useState(null);
    const [response, setResponse] = useState(null);
    const [password, setPassword] = useState('');
    const isRTL = I18nManager.isRTL;
    const currentLanguage = useSelector((state) => state.language.language);

    const logoutFunc = () => {
        // dispatch(logout());
        console.log('HelloLogout');

    }

    const setScreenFieldsDataApi = async () => {
        try {
            // dispatch(setLoading());
            const response = await setScreenFieldsData(fields, "M-SPS", "S-LOGIN-PAGE", { 'langid': isRTL ? 2 : 1 });
            setFields(response);
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    }

    useEffect(() => {
        dispatch(resetLoading());
        console.log('-------------------------LOGIN---------------------------', userProfile?.userId);
        console.log('LoginTriggerdLoading---------------------------', isLoading);
        console.log('LoginTriggerdToken---------------------------', userProfile?.isResetPassword);
        console.log('LoginTriggerdisAuthenticated---------------------------', isAuthenticated);
        console.log('LoginTriggerdField--------------------------', isAuthenticated);
        setScreenFieldsDataApi();

    }, [])
    const verifyOtpForCompanySelection = async (verifyOtpForm) => {

        console.log('stop2-------------', verifyOtpForm.userId);
        console.log(verifyOtpForm.toFactorEnable);
        try {
            const data = await verifyOtpAuthentication({ userId: verifyOtpForm.userId, toFactorEnable: verifyOtpForm.toFactorEnable, fireBaseToken: null });
            console.log('hellllllllllllll', data.code);
            if (data && data.code == 400) {
                Toast.show({
                    type: 'error', // 'error', 'info' can also be used
                    text1: data.btiMessage?.message,
                    text2: 'Error',
                });
                dispatch(resetLoading());
            } else if (data && data.code == 200) {
                if (data.result) {
                    dispatch(setUserData(data.result));
                    // this.authService.userProfile = data.result;/////////doubt

                    AsyncStorage.setItem('tenantid', '');
                    const currentUser = {
                        userId: data.result.userId,
                        session: data.result.session,
                        isResetPassword: data.result?.isResetPassword ? data.result?.isResetPassword : 'N'
                    }
                    // Login Notification
                    AsyncStorage.removeItem("logoutId");
                    AsyncStorage.removeItem("logoutSession");

                    await AsyncStorage.removeItem('currentUser');

                    if (data.result?.isResetPassword == 'Y') {
                        console.log('data.result?.isResetPassword1', data.result?.isResetPassword);
                        // const tempData = await AsyncStorage.getItem('isResetPassword');
                        // const value = JSON.parse(tempData);
                        // if (value && value.userId == currentUser?.userId) {
                        //     console.log('yahaaaa tkk ata', currentUser);
                        //     navigation.navigate('ResetPasswordScreen', { userId: value.userId });
                        //     return
                        // } else {
                        // await AsyncStorage.setItem('isResetPassword', JSON.stringify(currentUser));
                        // await AsyncStorage.removeItem('isResetPassword');
                        // }
                        // this.isResetPassword = data.result.isResetPassword;

                    }


                    // AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));
                    if (data.result.role == 'USER') {
                        console.log('data.result?.userId', currentUser?.userId);
                        // const userId = this.authService.userProfile.userId;
                        // const userId = userProfile.userId;
                        dispatch(setLoading());
                        const data = await companyListByUserId({ userId: currentUser?.userId });
                        // this.allCompanies = data.result;
                        if (data.result && data?.result?.length == 1) {
                            if (data?.result[0]?.companyId) {
                                proceed(data?.result[0]?.companyId, data.result?.customerNo, currentUser)
                                console.log('currentCompany', data?.result[0]?.name);

                                AsyncStorage.setItem('currentCompany', data?.result[0]?.name);
                            }
                        }
                        else {
                            console.log('companyyyyyyyyyy------triggered');
                            await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));
                            // this.router.navigate(["select-company"]);
                        }

                    } else {
                        validateUser(currentUser);
                    }
                    Toast.show({
                        type: 'success', // 'error', 'info' can also be used
                        text1: data.btiMessage?.message,
                        text2: 'Success!',
                    });
                    // dispatch(resetLoading());
                } else {
                    Toast.show({
                        type: 'error', // 'error', 'info' can also be used
                        text1: data.btiMessage?.message,
                        text2: 'Error!',
                    });
                    console.log('FaidaNi hai');

                    // if (data.result.isResetPassword == 'Y') {
                    //     console.log('resetmai aguayaaa--------------');
                    //     this.router.navigate(['resetpassword', data.result.userId]);
                    // }
                }
            }
            else {
                Toast.show({
                    type: 'error', // 'error', 'info' can also be used
                    text1: data.btiMessage?.message,
                    text2: 'Error',
                });
                dispatch(resetLoading());
            }
        }
        catch (error) {
            console.log(error);
            dispatch(resetLoading());
            Toast.show({
                type: 'error', // 'error', 'info' can also be used
                text1: 'Server error!',
                text2: 'Please contact to admin',
            });
        }
    }

    const validateUser = async (userData) => {
        try {
            // const getData = await AsyncStorage.getItem('currentUser') || '{}';
            // const userData = JSON.parse(getData);

            const lngId = isRTL ? '2' : '1';
            const tenantid = await AsyncStorage.getItem('tenantid') || {};
            const headers = { langid: lngId, userid: userData.userId, session: userData.session, tenantid: tenantid }
            const body = {
                email: await AsyncStorage.getItem('loginEmail'),
                customerId: await AsyncStorage.getItem('customerNumber') == undefined ? null : await AsyncStorage.getItem('customerNumber')
            }
            AsyncStorage.removeItem('customerNumber');

            // this.userId = userData.userId;
            // this.headers.append('session', userData.session);
            // this.headers.append('userid', userData.userId.toString());
            // const currentLanguage: any = localStorage.getItem('currentLanguage') ?
            //     localStorage.getItem('currentLanguage') : '1';
            // this.headers.append('langid', currentLanguage);
            // this.headers.append('tenantid', localStorage.getItem('tenantid') || '{}');

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
                        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

                        dispatch(setUserData({ siteId: siteId, priceLevel: priceLevelId, customerId: customerId }))
                        if (!!response.result.roles[0].path) {
                            console.log(response.result.roles[0].path);
                            dispatch(setToken());

                            // this.router.navigate([response.result.roles[0].path]);
                        }
                    }
                } else if (data.code === 400) {
                    console.log(' this.logOutPopUp();121212');
                    // this.logOutPopUp();
                }
            } else {
                console.log(' this.logOutPopUp();');
                // this.logOutPopUp();
            }
        } catch (error) {
            console.log('validateUser', error);
            dispatch(resetLoading());

        }
    }

    const proceed = async (selectedCompanyId, customerNo, activeUser) => {
        try {
            // const getUserData = await AsyncStorage.getItem('currentUser');
            // const activeUser = JSON.parse(getUserData);
            const reqBody = { 'companyId': selectedCompanyId, 'session': activeUser.session, 'userId': activeUser.userId }
            const data = await checkCompanyAccess(reqBody);
            const datacode = data.code;
            if (datacode === 200) {
                console.log('tenantidseyUper', data);
                dispatch(setUserData({ tenantid: data?.result?.companyTenantId, companyId: data?.result?.companyId }));
                AsyncStorage.setItem('tenantid', data.result.companyTenantId);
                AsyncStorage.setItem('companyId', String(data.result.companyId));

                if (activeUser.isResetPassword === 'Y') {
                    console.log('isResetPassword', activeUser.isResetPassword);
                    navigation.replace('ResetPasswordScreen', { userId: String(data.result?.userId) });
                    // this.router.navigate(['isResetpassword', data.result.userId]);
                } else {
                    // const companyName = this.allCompanies.find((x) => x.companyId === Number(selectedCompanyId)).name;
                    // localStorage.setItem('currentCompany', companyName);

                    if (!customerNo) {
                        console.log('customer0------------');
                        // this.getCustomersList();
                        return
                    }
                    validateUser(activeUser);
                }
            } else {
                Toast.show({
                    type: 'error', // 'error', 'info' can also be used
                    text1: data.btiMessage?.message,
                    text2: 'Error!',
                });
                dispatch(resetLoading());
            }
        } catch (error) {
            console.log('proccedInLogin', error);
            dispatch(resetLoading());
        }
    }

    const handleLogin = async () => {
        // dispatch(login({ userName: 'chinese.creativity.foundation@gmail.com', password: 'mind@123', fireBaseToken: null }));

        try {
            if (!validateEmail(email)) {
                setErrorMsg(fields?.['PLEASE_ENTER_VALID_EMAIL']?.fieldValue || 'Please Enter valid email');
                return;
            }

            // // if (!validatePassword(password)) {
            if (!password) {
                setErrorMsg(t('requiredValid'));
                return;
            }
            setErrorMsg('');
            dispatch(setLoading());
            const reqBody = {
                userName: email,
                password: password,
                fireBaseToken: null
            }
            const data = await loginUserForOtp(reqBody);
            console.log(data);
            if (data) {
                // let newHeaders = new HttpHeaders();
                // const userData = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') || '{}') : { session: '', userId: '' };
                // newHeaders = newHeaders.append('session', userData.session);
                // newHeaders = newHeaders.append('content-type', 'application/json');
                // newHeaders = newHeaders.append('userid', userData.userId.toString());

                AsyncStorage.setItem('userName', reqBody.userName);
                AsyncStorage.setItem('showOutstandingsUpcoming', 'true')
                if (data.code != 302 && data.code != 404) {
                    setResponse(data.result);
                    await AsyncStorage.setItem('loginEmail', reqBody.userName);
                    // if (loginForm.value.remember) {
                    //     localStorage.setItem('isRemember', loginForm.value.remember);
                    // } else {
                    //     localStorage.setItem('isRemember', 'false');
                    // }
                    await AsyncStorage.setItem('clientAppVersion', String(data.result?.clientAppVersion) || '');
                    await AsyncStorage.setItem('Version', '17');
                    if (data.result?.clientAppVersion === 17) {
                        if (data.result?.toFactorEnable) {
                            console.log('navigatinProcess-----------------,waiting ot you');
                            // navigation?.navigate('Dashboard');

                            // navigation.navigate(['verify-otp'], {
                            //     queryParams: {
                            //         id: this.response.userId,
                            //         password: this.response.password
                            //     }
                            // });
                        } else {
                            console.log('navigatinProcess-----------------,waiting ot Both');
                            // this.verifyOtpForCompanySelection(this.response);
                        }
                    } else {
                        console.log('loginedIn Process continetilll');
                        if (data.result?.toFactorEnable) {
                            console.log('navigatinProcess-----------------,waiting ot you too');
                            // navigation.navigate(['verify-otp'], {
                            //     queryParams: {
                            //         id: this.response.userId,
                            //         password: this.response.password
                            //     }
                            // });
                        } else {
                            console.log('stop----------1');
                            verifyOtpForCompanySelection(data.result);
                        }
                    }
                }
                else if (data.code == 404) {
                    if (data.btiMessage.messageShort == "INVALID_USERNAME_AND_PASSWORD") {
                        Toast.show({
                            type: 'error', // 'error', 'info' can also be used
                            text1: data.btiMessage?.message,
                            text2: 'Error',
                        });
                    }
                    dispatch(resetLoading());
                }
                // else if (data.code == 302) {
                //     if (data.btiMessage.messageShort == "USER_SESSION_ALREADY_EXIST") {
                //         this.messageText = data.btiMessage.message;
                //         Utils.notification(this.messageText, 'error');
                //         this.userId = data.result?.userId;
                //         this.session = data.result?.session;
                //         const body = {
                //             userId: this.commonService.multiTenFlag + this.userId,
                //             email: this.commonService.multiTenFlag + loginForm.value.userName
                //         }
                //         this.loginNotificationService.notifyLogginedUser(body).subscribe((data: any) => {
                //             if (data.code == 201) {
                //                 swal.fire({
                //                     'title': Constants.confirmationModalTitle,
                //                     'text': Constants.ARE_YOU_SURE_WANT_TO_REMOVE_SESSION,
                //                     'icon': 'warning',
                //                     'showCancelButton': true,
                //                     'confirmButtonText': Constants.YesText,
                //                     'cancelButtonText': Constants.NoText,
                //                     'allowOutsideClick': false,
                //                     'allowEscapeKey': false,
                //                 }).then((result) => {
                //                     if (result.isConfirmed) {
                //                         let body = {
                //                             userName: this.commonService.multiTenFlag + loginForm.value.userName,
                //                             status: "PENDING"
                //                         }
                //                         this.loginService.loginNotificationUpdateStatus(body).subscribe();
                //                         setTimeout(() => {
                //                             Utils.showLoader('.page-body');
                //                             let timerInterval:
                //                             swal.fire({
                //                                 'imageUrl': '/assets/images/loader.gif',
                //                                 'imageHeight': '50',
                //                                 // 'title': Constants.WAITING_FOR_CONFIRMATION,
                //                                 'title': 'Waiting For Confirmation',
                //                                 // 'html': '<h4>' + Constants.TIME_REMAINING + ': <strong></strong> ' + Constants.SECONDS + '.</h4>',
                //                                 'html': '<h4>' + 'Time Remaining' + ': <strong></strong> ' + "Seconds" + '.</h4>',
                //                                 'showConfirmButton': false,
                //                                 'timerProgressBar': true,
                //                                 'allowOutsideClick': false,
                //                                 'allowEscapeKey': false,
                //                                 timer: 30000,
                //                                 didOpen: () => {
                //                                     timerInterval = setInterval(() => {
                //                                         this.loginNotificationService.checkLogingStatus(body).subscribe((data: any) => {

                //                                             if (data.code == 202) {

                //                                                 clearInterval(timerInterval);
                //                                                 this.isAccept = true;
                //                                                 swal.close();
                //                                                 this.loginCehckIfDenied = false;
                //                                             }
                //                                             if (data.code == 403) {
                //                                                 clearInterval(timerInterval);
                //                                                 this.isAccept = false;
                //                                                 swal.close();
                //                                                 setTimeout(() => {
                //                                                     Utils.notification('Permission Denied', 'error');
                //                                                 }, 100);
                //                                                 this.loginCehckIfDenied = true;
                //                                             }
                //                                             if (data.code == 421) {
                //                                                 this.isAccept = false;
                //                                                 swal.close()
                //                                                 setTimeout(() => {
                //                                                     Utils.notification('Permission Denied', 'error');
                //                                                 }, 100);
                //                                                 this.loginCehckIfDenied = false;
                //                                             }
                //                                         });
                //                                         const htmlContainer = swal.getHtmlContainer();
                //                                         if (htmlContainer) {
                //                                             const strongElement = htmlContainer.querySelector('strong');
                //                                             if (strongElement) {
                //                                                 const timerLeft = swal.getTimerLeft();
                //                                                 if (timerLeft !== null && timerLeft !== undefined) {
                //                                                     strongElement.textContent = (timerLeft / 1000).toFixed(0);
                //                                                 }
                //                                             }
                //                                         }

                //                                     }, 1000)
                //                                 },
                //                                 didClose: () => {
                //                                     clearInterval(timerInterval)
                //                                 },
                //                             }).then((result) => {

                //                                 const body: any = {
                //                                     "userId": this.userId
                //                                 }
                //                                 localStorage.setItem("logoutId", this.userId);
                //                                 localStorage.setItem("logoutSession", this.session);

                //                                 this.loginNotificationService.updateStatusAfterNoAction(body).subscribe((data: any) => {
                //                                     if (data.code == 200) {

                //                                         if (!this.loginCehckIfDenied) {
                //                                             let userId = this.commonService.multiTenFlag + this.userId;
                //                                             let body: any = {
                //                                                 userId: userId,
                //                                                 status: "ACCEPTED"
                //                                             }
                //                                             this.loginService.loginNotificationUpdateStatus(body).subscribe();
                //                                             if (localStorage.getItem('companyId')) {
                //                                                 this.authService.logOut(JSON.stringify(this.userId)).subscribe(() => {
                //                                                     localStorage.removeItem('currentUser');
                //                                                     this.router.navigate(['login']);
                //                                                 });
                //                                             }
                //                                             else {

                //                                                 this.authService.logOutBeforeCompanySelection(this.userId).subscribe(() => {
                //                                                     localStorage.removeItem('currentUser');
                //                                                     this.router.navigate(['login']);
                //                                                 });
                //                                             }

                //                                             this.isAccept = true;
                //                                             this.timerClosed = true;

                //                                             setTimeout(() => {
                //                                                 this.login(this.form);
                //                                             }, 1500);
                //                                         }

                //                                     } else {
                //                                         this.timerClosed = true;
                //                                         if (result.isDismissed) {
                //                                             if (result.dismiss) {
                //                                                 var state: any = result.dismiss
                //                                                 if (state == "timer") {
                //                                                     this.clearSessionAndLogin();
                //                                                 }
                //                                             } else {
                //                                                 if (this.isAccept) {
                //                                                     this.login(this.form);
                //                                                 }
                //                                             }

                //                                         }
                //                                     }
                //                                 });
                //                             })
                //                         }, 3000);

                //                     }
                //                 });
                //             }
                //         });
                //     }

                // } 
                else {
                    Toast.show({
                        type: 'error', // 'error', 'info' can also be used
                        text1: data.btiMessage?.message,
                        text2: 'Error',
                    });
                    dispatch(resetLoading());
                }
            }

        } catch (error) {
            Toast.show({
                type: 'error', // 'error', 'info' can also be used
                text1: 'Server Error!',
                text2: 'Please contact to admin',
            });
            console.log('LoggedInFunction', error);
            dispatch(resetLoading());
        }

        // setErrorMsg(isLoading);
        // navigation?.navigate('Dashboard');
    };



    return (
        <ScrollView style={styles.container}>
            <LanguageSwitcher></LanguageSwitcher>
            {fields && <View style={{ marginVertical: 180, }}>
                {/* <Text style={{ fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: 'black' }}>{t('welcome')}</Text> */}
                <Text style={{ fontSize: 35, fontWeight: 'bold', textAlign: 'center', color: 'black' }}>{fields?.['LOGIN']?.fieldValue || 'Login'}</Text>
                <Text style={{ fontSize: 22, fontWeight: '400', textAlign: 'center', color: 'grey', marginBottom: 20, }}>
                    {fields?.['SIGN_IN_TO_ACCESS_AN_ENHANCED_SHOPPING_EXPERIENCE']?.fieldValue || 'Sign in to access an enhanced shopping experience'}
                </Text>
                <TextInput
                    placeholder={fields?.['EMAIL_ADDRESS']?.fieldValue || 'Email Address'}
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={colors.grey}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder={fields?.['PASSWORD']?.fieldValue || 'Password'}
                    value={password}
                    placeholderTextColor={colors.grey}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />
                {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
                <TouchableOpacity style={[styles.input, isLoader ? { backgroundColor: 'lightgrey' } : { backgroundColor: 'black' }]}
                    disabled={isLoader} onPress={handleLogin}
                >
                    <Text style={{ color: colors.white, textAlign: 'center', fontSize: 20 }}>{fields?.['LOGIN']?.fieldValue || 'Login'}</Text>
                </TouchableOpacity>
                {/* <Button title={isLoading ? 'Logging in...' : 'Login'} disabled={isLoading} /> */}
            </View>}
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: colors.primary,
        // backgroundColor: 'pink',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    input: {
        borderColor: 'lightgrey',
        borderWidth: 1,
        borderRadius: 30,
        marginVertical: 20,
        padding: 15,
        color: colors.black,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    error: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default LoginScreen;
