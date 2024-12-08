// /navigation/RootNavigator.js
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';
import { ActivityIndicator, AppState, StatusBar, Image, StyleSheet, Text, View } from 'react-native';
import { checkSession, login, logout, refreshToken, setLoading, setRefreshToken } from '../redux/slices/authSlice';
import NetInfo from '@react-native-community/netinfo';[]
import Toast from 'react-native-toast-message';
import colors from '../Utils/colors';
import FastImage from 'react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { updateActiveSession } from '../services/auth';

const RootNavigator = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { token, isAuthenticated, isLoading, userProfile, refreshToken } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.language);


    // const [appState, setAppState] = useState(AppState.currentState);
    // const [isConnected, setIsConnected] = useState(true);
    //     useFocusEffect(
    //         useCallback(() => {
    //         console.log('RoorNavigator focused');
    //         // You can add logic that needs to happen when the drawer screen is focused here

    //         // Optional cleanup function if needed
    //         return () => {
    //             console.log('RoorNavigator unfocused');
    //         };
    //     })
    // );


    // const handleAppStateChange = nextAppState => {
    //     if (appState.match(/inactive|background/) && nextAppState === 'active') {
    //         console.log('App has come to the foreground');
    //         // When the app comes to the foreground, check session or retry failed API calls
    //         if (isConnected) {
    //             console.log('App has come to the Connect');
    //             // checkSession();
    //         }
    //     }
    //     setAppState(nextAppState);
    // };

    // useEffect(() => {
    //     // Listen for app state changes
    //     const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    //     // Listen for network status changes
    //     const unsubscribeNetInfo = NetInfo.addEventListener(state => {
    //         console.log('App has come to the syoooo', state?.isConnected);
    //         setIsConnected(state.isConnected || false);
    //     });

    //     // Cleanup listeners
    //     return () => {
    //         appStateListener.remove();
    //         unsubscribeNetInfo();
    //     };
    // }, []);
    const getHeader = async () => {
        const lngId = language == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    const updateSession = async () => {
        // Clear the old interval first
        // clearSessionInterval();
        let header = await getHeader();  // Fetch updated header
        if (header && header?.userid && header?.session) {
            const req = { userId: header.userid, session: header.session };
            const res = updateActiveSession(req, header);
            dispatch(checkSession());
            // Set the new interval
        } else {
            dispatch(logout());  // Logout if the header is invalid
        }
    };

    useEffect(() => {
        console.log('RootNavigator-------------Authenticated', isAuthenticated);
        let authInterval;
        if (isAuthenticated) {
            authInterval = setInterval(() => {
                updateSession();

            }, 50000)
        }
        // console.log('yooooooooooooooooo', isLoading);
        // console.log('yooooooooooooooooo', token);
        // if (token) {
        //     // Optionally, dispatch token validation or refresh here

        //     dispatch(refreshToken());
        // }

        return () => clearInterval(authInterval);
    }, [isAuthenticated]);
    // }, [dispatch, isAuthenticated, token]);

    return (
        <>
            {/* <StatusBar style={{ backgroundColor: 'red' }}></StatusBar> */}
            <StatusBar
                barStyle={isAuthenticated ? 'light-content' : 'dark-content'}
                backgroundColor={isAuthenticated ? colors.secondary : colors.primary}
            />
            {isLoading && <View style={styles.loader}>
                <FastImage
                    source={require('../assets/images/Ripple-1s-200px.gif')} // Local GIF
                    style={{ width: 80, height: 80, opacity: .9 }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {/* <ActivityIndicator size="large" /> */}
            </View>}
            {isAuthenticated ? <DrawerNavigator /> : <AuthStack />}
        </>
    );
    return <View><Text style={{ color: 'pink', justifyContent: 'center', fontSize: 20, textAlign: 'center' }}>HelloBay</Text></View>;
    return <AuthStack />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'aqua',
        // backgroundColor: '#f6eee1',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    loader: {
        zIndex: 10,
        top: 0,
        left: 0, right: 0,
        bottom: 0,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: .7,
        backgroundColor: colors.primary
    }
});
export default RootNavigator;
