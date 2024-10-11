// Example: /screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { logout, setLoading, resetLoading } from '../redux/slices/authSlice';

const VerifyOtpScreen = ({ navigation, route }) => {
    // const { t } = useTranslation();
    const dispatch = useDispatch();
    const { userId } = route.params || '';

    const logoutFunc = () => {
        console.log('heloLogout');
        dispatch(setLoading());
        dispatch(resetLoading());
        // dispatch(logout());

        // try {

        // } catch (error) {
        //     console.log();

        // }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{'welcome VerifyOtpScreen' + userId}</Text>
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

export default VerifyOtpScreen;
