import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../Utils/colors';

export default CustomPopup = ({
    visible,
    onClose,
    type,
    onConfirm,
    title = "Are you sure?",
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
        },
        popup: {
            marginHorizontal: 20,
            padding: 20,
            backgroundColor: colors.white,
            borderRadius: 10,
        },
        title: {
            textAlign: 'center',
            fontSize: 18,
            marginBottom: 10,
            color: colors.grey,
        },
        buttonContainer: {
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        cancelButton: {
            flex: 1,
            padding: 10,
            alignItems: 'center',
            backgroundColor: '#ccc',
            borderRadius: 5,
            marginRight: 5,
        },
        confirmButton: {
            flex: 1,
            padding: 10,
            alignItems: 'center',
            // backgroundColor: '#2196F3',
            backgroundColor: colors.secondary,
            borderRadius: 5,
            marginLeft: 5,
        },
        cancelText: {
            color: '#333',
            fontWeight: 'bold',
        },
        confirmText: {
            color: 'white',
            fontWeight: 'bold',
        },
        openButton: {
            fontSize: 18,
            color: '#2196F3',
        },

    });


    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};