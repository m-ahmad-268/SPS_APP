// /components/LanguageSwitcher.js
import React, { useState, useTransition } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import Icon from 'react-native-vector-icons/Ionicons';
import DownIcon from '../assets/icons/arrowDown.svg';
import ArrowUp from '../assets/icons/arrowUp.svg';
import '../i18n/i18n';
import colors from '../Utils/colors';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ styleProp }) => {
    const dispatch = useDispatch();
    const currentLanguage = useSelector((state) => state.language.language);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { t } = useTranslation();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'عربي' },
    ];

    const switchLanguage = (lang) => {
        dispatch(setLanguage(lang));
        if (lang === 'ar') {
            I18nManager.forceRTL(true);
        } else {
            I18nManager.forceRTL(false);
        }
        RNRestart.Restart(); // Restart the app to apply RTL changes
    };

    const handleLanguageChange = (code) => {
        // setSelectedLanguage(code);
        switchLanguage(code);
        setDropdownOpen(false);
    };

    return (
        <View style={[styles.dropdownContainer, styleProp]}>
            <TouchableOpacity style={styles.dropdownHeader} onPress={() => setDropdownOpen(!dropdownOpen)}>
                <Text style={styles.selectedText}>
                    {currentLanguage == 'ar' ? "عربي" : 'English'}
                </Text>
                {!dropdownOpen ? <DownIcon width={26} height={26} /> :
                    <ArrowUp width={26} height={26} />}
            </TouchableOpacity>

            {dropdownOpen && (
                <FlatList
                    data={languages}
                    keyExtractor={item => item.code}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => (currentLanguage != item.code) && handleLanguageChange(item.code)} style={styles.dropdownItem}>
                            <Text style={styles.itemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownContainer: {
        position: 'absolute',
        // alignSelf: 'flex-end',
        // margin: 20,
        // backgroundColor: 'red',
        // alignItems: 'flex-end',
    },
    dropdownHeader: {
        padding: 10,
        flexDirection: 'row',
        // alignItems: 'center',
    },
    selectedText: {
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
    dropdownItem: {
        padding: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    itemText: {
        fontSize: 14,
        color: colors.grey,
        textAlign: 'left',
    },
});

export default LanguageSwitcher;
