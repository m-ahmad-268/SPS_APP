import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollView, StyleSheet, TextInput, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import colors from '../../Utils/colors';
import { Button } from 'react-native-paper';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
// import { setScreenFieldsData, getUserDetailByUserID, updateCustomerBillingAddress, GetPermissionsofEditableFields } from '../../services/apiService';
// import styles from './styles';
// import showToast from '../../utils/toast';

const BillingInfo = ({ permissions, activeCustomer, fields, onClickSubmit }) => {
    const userDetails = useSelector((state) => state.auth.userDetails);
    const { t } = useTranslation();
    const dispatch = useDispatch();


    const customerId1 = userDetails?.customerId ? userDetails?.customerId : null;

    // Formik setup
    const formik = useFormik({
        initialValues: {
            billingAddress1: activeCustomer?.billingAddress || '',
            billingAddress2: activeCustomer?.billingAddress3 || '',
        },
        validationSchema: Yup.object({
            billingAddress1: Yup.string().required(t('requiredValid')),
            // billingAddress2: Yup.string().required(t('Billing Address 2 is required')),
        }),
        enableReinitialize: true,
        onSubmit: async values => {
            try {
                // dispatch(setLoading());
                // Prepare data to be sent to the API
                let reqbody = {
                    ...activeCustomer,
                }

                reqbody.billingAddress = values.billingAddress1; // Update specific fields
                reqbody.billingAddress3 = values.billingAddress2;
                onClickSubmit(reqbody);

                // const response = await updateCustomerBillingAddress(updatedData, customHeaders);
                // if (response?.code === 200) {
                //     setUserDataMethodAndPermissions()
                //     showToast("Billing address updated successfully", 'success');
                // }

                // Optionally, fetch updated data or show success message
            } catch (error) {
                console.error('Update error:', error);
                dispatch(resetLoading());
                // Optionally, show error message
            }
        },
    });

    useEffect(() => {
        dispatch(resetLoading());
    }, [activeCustomer]);


    const setUserDataMethodAndPermissions = async () => {
        try {
            dispatch(setLoading());

            // Fetch customer details
            const customerData = await getUserDetailByUserID({ customerId: customerId1 }, customHeaders);

            if (customerData?.code === 302) {
                const userDetailsDto = customerData?.result;
                console.log('userDetailsDto', userDetailsDto);
                setDetailedUserData(userDetailsDto);
                const editablePermissions = await GetPermissionsofEditableFields({ custnumber: customerId1 }, customHeaders);

                if (editablePermissions?.code === 200) {
                    setEditablePermissions(editablePermissions?.result);
                    dispatch(resetLoading());
                } else {
                    setEditablePermissions([]);
                    dispatch(resetLoading());
                }
            } else {
                setDetailedUserData({});
                showToast("Failed to fetch user details.", "error");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("An error occurred while fetching data.");
        } finally {
            // Always stop loading after the process
            dispatch(resetLoading());
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {fields?.['BILLING_ADDRESS']?.fieldValue || 'Billing Address 1'}
            </Text>
            <TextInput
                style={[styles.input, !permissions?.isEditableBillingAddress1 && styles.disableInput]} // Gray background for non-editable fields
                value={formik.values.billingAddress1}
                onChangeText={formik.handleChange('billingAddress1')}
                onBlur={formik.handleBlur('billingAddress1')}
                multiline
                editable={(permissions?.isEditableBillingAddress1)}
            />
            {formik.errors.billingAddress1 && formik.touched.billingAddress1 && (<Text style={styles.errorText}>{formik.errors.billingAddress1}</Text>)}
            <Text style={styles.label}>
                {fields?.['BILLING_ADDRESS']?.fieldValue + ' 2' || 'Billing Address 2'}
            </Text>
            <TextInput
                style={[styles.input, !permissions?.isEditableBillingAddress2 && styles.disableInput]} // Gray background for non-editable fields
                value={formik.values.billingAddress2}
                onChangeText={formik.handleChange('billingAddress2')}
                onBlur={formik.handleBlur('billingAddress2')}
                multiline
                editable={(permissions?.isEditableBillingAddress2)}
            />
            <View style={styles.bottomRow}>
                <Button style={styles.bottonBtn} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.handleSubmit()} mode="contained" >
                    {t('update')}
                </Button>
                <Button style={{ ...styles.bottonBtn, backgroundColor: colors.black }} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.resetForm()} mode="contained" >
                    {t('clear')}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    label: {
        color: colors.black,
        fontSize: 16,
    },
    errorText: {
        color: colors.red,
        fontSize: 10,
    },
    disableInput: {
        backgroundColor: colors.lightgrey
    },
    input: {
        marginVertical: 5,
        borderColor: colors.lightgrey,
        color: colors.black,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 13,
    },
    bottomRow: {
        gap: 10,
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottonBtn: {
        flex: 1,
        borderRadius: 5,
        backgroundColor: colors.secondary,
    },
})

export default BillingInfo;
