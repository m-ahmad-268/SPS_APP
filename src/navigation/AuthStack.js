// /navigation/AuthStack.js
import React, { useCallback, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { useSelector } from 'react-redux';
import SetPasswordScreen from '../screens/SetPasswordScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    return (
        <Stack.Navigator initialRouteName={userProfile?.isResetPassword == 'Y' ? 'ResetPasswordScreen' : 'Login'}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SetPasswordScreen" component={SetPasswordScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: true }} /> */}
        </Stack.Navigator>
    )
};

export default AuthStack;
