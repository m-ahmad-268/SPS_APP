import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure you have FontAwesome or any other icon library installed
import EyeIcon from '../assets/icons/eye.svg';
import colors from '../Utils/colors';

const PasswordField = ({ value, onChangeText, placeholder, style }) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={styles.input}
                placeholder={placeholder || 'Enter password'}
                placeholderTextColor={colors.grey}
                secureTextEntry={!isPasswordVisible} // Toggle visibility
                value={value}
                onChangeText={onChangeText}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={[isPasswordVisible && styles.iconContainer]}>
                <EyeIcon width={25} height={25} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'lightgrey',
        borderWidth: 1,
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    input: {
        flex: 1,
        color: colors.black,
        paddingVertical: 10,
        paddingHorizontal: 5,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    iconContainer: {
        opacity: .3
    },
});

export default PasswordField;
