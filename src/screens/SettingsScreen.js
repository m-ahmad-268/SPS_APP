// /screens/SettingsScreen.js
import React, { useCallback, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { setToken } from '../redux/slices/authSlice';
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = () => {
    const dispatch = useDispatch();
    const { i18n } = useTranslation();
    const currentLanguage = useSelector((state) => state.language.language);
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);

    useFocusEffect(
        useCallback(() => {
            return () => {
                console.log('--------------------------------------HomescreenTriggered unfocused');
                dispatch(setToken()); // Clean-up or reset logic
            };
        }, [userProfile])
    );

    useEffect(() => {
        console.log('-------------------------SettingcreenTriggered  Entrances-----------------', userProfile);


    }, [])

    const switchLanguage = async (lang) => {
        dispatch(setLanguage(lang));
        await i18n.changeLanguage(lang);
        if (lang === 'ar') {
            I18nManager.forceRTL(true);
        } else {
            I18nManager.forceRTL(false);
        }
        // Reload the app to apply RTL changes
        // Note: You need to install react-native-restart for this
        // npm install react-native-restart

        RNRestart.Restart();
    };



    return (
        <View style={styles.container}>
            <Button title="Switch to English" onPress={() => switchLanguage('en')} disabled={currentLanguage === 'en'} />
            <Button title="Switch to Arabic" onPress={() => switchLanguage('ar')} disabled={currentLanguage === 'ar'} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
});

export default SettingsScreen;
