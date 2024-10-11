// /screens/CustomerDetails.js
import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerDetails } from '../redux/slices/customerSlice';
import { useTranslation } from 'react-i18next';

const CustomerDetails = () => {
    const dispatch = useDispatch();
    const { details, isLoading, error } = useSelector((state) => state.customer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(fetchCustomerDetails());
    }, [dispatch]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{t('errorFetchingCustomers')}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={details}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.info}>{item.email}</Text>
                    {/* Add more customer details as needed */}
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    name: {
        fontWeight: 'bold',
    },
    info: {
        color: '#555',
    },
});

export default CustomerDetails;
