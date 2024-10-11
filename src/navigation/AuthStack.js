// /navigation/AuthStack.js
import React, { useCallback, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import Dashboard from '../screens/Dashboard'; // If you have a signup screen
import { SafeAreaView, View } from 'react-native';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();

const AuthStack = () => {
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    return (
        <Stack.Navigator initialRouteName={userProfile?.isResetPassword == 'Y' ? 'ResetPasswordScreen' : 'Login'}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyOtpScreen" component={VerifyOtpScreen} options={{ headerShown: true }} />
            {/* <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: true }} /> */}
        </Stack.Navigator>
    )
};

export default AuthStack;
