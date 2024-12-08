// /screens/SettingsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput } from 'react-native';
import { ActivityIndicator, Button, IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { setScreenFieldsData } from '../../services/auth';
import RNFetchBlob from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import { getCustomerOrderById } from '../../services/drawerService';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
import colors from '../../Utils/colors';
import CustomFlaglist from '../../Shared/CustomFlaglist';
import getEnvVars from '../../Config/env';

const EditInvoiceScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { imsModuleApiDirectBaseUrl } = getEnvVars();
    const [fields, setFields] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);
    const [allData, setAllData] = useState([]);
    const { ...params } = route.params || '';
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);

    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return {
            langid: lngId, 'content-type': 'application/json',
            userid: String(userProfile?.userId), session: userProfile?.session, tenantid: userProfile?.tenantid
        };
    };

    const downloadRecord = async (recordId) => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const reqBody = {
                hideItemNumber: false,
                id: Number(orderDetail.dtoSalesTransactionEntry?.id),
                landscape: false,
                printQtyandRate: false,
                printedByName: userProfile.firstName + ' ' + userProfile.lastName,
                showExpenses: false,
                showHeaderAndFooter: true,
                showZeroQtyItem: false,
                showItemWithZeroQtyInQuotation: "na"
            };

            const downloadDest = `${RNFetchBlob.fs.dirs.DownloadDir}/invoice_${orderDetail.dtoSalesTransactionEntry?.id}.pdf`;
            let response = await RNFetchBlob.config({
                fileCache: true,
                // appendExt: 'pdf',
                path: downloadDest,
            })
                .fetch('POST', `${imsModuleApiDirectBaseUrl}/salesTransactionEntry/printSaleTransaction`, headers, JSON.stringify(reqBody))
                .then((res) => {
                    // console.log('File downloaded to:', res.path());
                    return res;
                });

            await FileViewer.open(response.path())
                .then(() => {
                    dispatch(resetLoading());
                    // console.log('File opened successfully');
                })
                .catch((error) => {
                    dispatch(resetLoading());
                    console.error('Error opening file:', error);
                });

        } catch (error) {
            console.error("Error saving downloadRecord address:", error);
            dispatch(resetLoading());
        }

    };

    const assignArray = (transactionList) => {
        try {
            const arr = transactionList.map((x, index) => {
                const rand = Math.random() * (100 - 1 + 1) + 1;
                return {
                    ...x,
                    key: x.id + index + rand,
                    showHeader: false,
                    // headerTitile: 'Order Number',
                    // headerTitleValue: x?.orderRefNo,
                    // headerDesc: 'Transaction Date',
                    // headerDescValue: x?.transationDate,
                    orderRefNo: x?.orderRefNo,
                    cardHeader: fields?.['ORDER_FROM']?.fieldValue || 'Order From',
                    returnedQty: 0,
                    rows: [
                        {
                            show: true,
                            rowTitle: fields?.['ITEM_NUMBER']?.fieldValue || 'Item Number',
                            rowValue: x?.itemNumber?.itemNumber,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['DESCRIPTION']?.fieldValue || 'Description',
                            rowValue: x?.itemNumber?.description,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['SHIPMENT_DATE']?.fieldValue || 'Shipment Date',
                            rowValue: x?.shippmentDate,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['UOM']?.fieldValue || 'UOM',
                            rowValue: x?.unitOfMeasureScheduleId?.unitOfMeasureId,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['ORDER_QUANTITY']?.fieldValue || 'Order Quantity',
                            rowValue: x?.currentQuantityOnHand,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['QUANTITY']?.fieldValue || 'Quantity',
                            rowValue: x?.quantity,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['UNIT_PRICE']?.fieldValue || 'Unit Price',
                            rowValue: x?.costPrice,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['EXTENDED_PRICE']?.fieldValue || 'Extended Price',
                            rowValue: x?.extendedPrice,
                        },
                    ],
                    // btnArray: [
                    //     {
                    //         title: x?.status || x?.returnStatus,
                    //         type: x?.status || x?.returnStatus,
                    //     },
                    // ]
                }
            })
            if (arr.length)
                setAllData([...arr]);
            dispatch(resetLoading());
        } catch (error) {
            console.log('assignArray', error);
            dispatch(resetLoading());
        }
    };

    const getById = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const response = await getCustomerOrderById(params, headers);
            if (response && response?.code == 201 && response?.result) {
                setOrderDetail(response?.result);
                const list = response.result?.dtoSalesTransactionEntry?.salesTransactionEntryGridList;
                if (list && list?.length) {
                    assignArray(list);
                } else {
                    dispatch(resetLoading());

                }
            } else {
                dispatch(resetLoading());
            }
        } catch (error) {
            dispatch(resetLoading());
            console.error('getCustomerOrderById error:', error);
        }
    };

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-ORDER-DETAIL", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);

        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    };

    useEffect(() => {
        console.log('-------------------------HomeScreen Entrances-----------------', currentLanguage);
        setScreenFieldsDataApi();
        getById();
    }, []);

    // const logoutFunc = async () => {

    //     try {
    //         dispatch(setLoading());
    //         const getData = await AsyncStorage.getItem('currentUser');
    //         const userData = JSON.parse(getData);
    //         // console.log('heloLogout', userData.userId);
    //         const lngId = isRTL ? '2' : '1';
    //         const tenantid = await AsyncStorage.getItem('tenantid') || {};
    //         const headers = { langid: lngId, userid: userData.userId, session: userData.session, tenantid: tenantid }
    //         const data = await logoutApi({ userId: userData.userId }, headers)
    //         // console.log(data);
    //         dispatch(logout());
    //     } catch (error) {
    //         console.log('LogoutError', error);
    //         dispatch(resetLoading());
    //     }
    // };

    return (
        <>
            <CustomHeader navigation={navigation} headerTitle={true ? fields?.['INVOICE_DETAILS']?.fieldValue || 'Invoice Details' : fields?.['EDIT_QUOTATION']?.fieldValue || 'Edit Quotation'} />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['ORDER_NUMBER']?.fieldValue || 'Order Number'}</Text>
                            <Text style={styles.label}>{orderDetail?.referenceNo || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['TRANSACTION_DATE']?.fieldValue || 'Transaction Date'}</Text>
                            <Text style={styles.label}>{orderDetail?.dtoSalesTransactionEntry?.transactionDate || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['SHIPMENT_DATE']?.fieldValue || 'Shipment Date'}</Text>
                            <Text style={styles.label}>{orderDetail?.dtoSalesTransactionEntry?.customerShipmentDate || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['EXPECTED_SHIPMENT_DATE']?.fieldValue || 'Expected Shipment Date'}</Text>
                            <Text style={styles.label}>{orderDetail?.dtoSalesTransactionEntry?.expectedShipmentDateSPS || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['NOTES']?.fieldValue || 'Notes'}</Text>
                            <Text style={styles.label}>{orderDetail?.dtoSalesTransactionEntry?.notes || 'N/A'}</Text>
                        </View>
                    </View>
                    {fields && <CustomFlaglist listData={allData} getId={() => false}
                        buttonTitle={{
                            show: false,
                            nestedScrollCheck: false,
                        }} />}

                    <View style={{ gap: 7, marginBottom: 30, marginHorizontal: 25, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.paymentShortText}>{fields?.['SUB_TOTAL']?.fieldValue || 'Sub Total'}</Text>
                            <Text style={styles.paymentShortText}>{orderDetail?.dtoSalesTransactionEntry?.subTotal ? Number(orderDetail?.dtoSalesTransactionEntry?.subTotal).toFixed(2) : '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.paymentShortText}>{fields?.['ITEM_DISCOUNT']?.fieldValue || 'Item Discount'}</Text>
                            <Text style={styles.paymentShortText}>{orderDetail?.dtoSalesTransactionEntry?.itemLevelTD ? Number(orderDetail?.dtoSalesTransactionEntry?.itemLevelTD).toFixed(2) : '0.00'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.paymentShortText}>{fields?.['TRADE_DISCOUNT']?.fieldValue || 'Trade Discount'}</Text>
                            <Text style={styles.paymentShortText}>{orderDetail?.dtoSalesTransactionEntry?.tradeDiscount ? Number(orderDetail?.dtoSalesTransactionEntry?.tradeDiscount).toFixed(2) : '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.paymentShortText}>{fields?.['OTHER_EXPENSES']?.fieldValue || 'Other Expense'}</Text>
                            <Text style={styles.paymentShortText}>{orderDetail?.dtoSalesTransactionEntry?.otherExpenses ? Number(orderDetail?.dtoSalesTransactionEntry?.otherExpenses).toFixed(2) : '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.paymentShortText}>{fields?.['OTHER_EXPENSES_VAT']?.fieldValue || 'Other Expense Vat'}</Text>
                            <Text style={styles.paymentShortText}>{orderDetail?.dtoSalesTransactionEntry?.otherExpensesVat ? Number(orderDetail?.dtoSalesTransactionEntry?.otherExpensesVat).toFixed(2) : '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.paymentShortText}>{fields?.['VAT']?.fieldValue || 'Vat'}</Text>
                            <Text style={styles.paymentShortText}>{orderDetail?.dtoSalesTransactionEntry?.vatSar ? Number(orderDetail?.dtoSalesTransactionEntry?.vatSar).toFixed(2) : '-'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopColor: colors.grey, borderTopWidth: .5, padding: 7 }}>
                            <Text style={{ ...styles.paymentShortText, fontWeight: 'bold' }}>{fields?.['TOTAL']?.fieldValue || 'Total'}</Text>
                            <Text style={{ ...styles.paymentShortText, fontWeight: 'bold' }}>{orderDetail?.dtoSalesTransactionEntry?.total ? Number(orderDetail?.dtoSalesTransactionEntry?.total).toFixed(2) : '-'}</Text>
                        </View>
                        <Button onPress={() => navigation.navigate('CreateReturnScreen', { id: params })}
                            style={[styles.btn, { backgroundColor: colors.success }]} mode="contained" textColor={colors.white} >
                            {fields?.['RETURN']?.fieldValue || 'Return'}
                        </Button>
                        <Button onPress={() => navigation.navigate('AttachmentScreen', { id: orderDetail.dtoSalesTransactionEntry?.id, fields: fields })}
                            style={[styles.btn, { backgroundColor: colors.blue }]} mode="contained" textColor={colors.white} >
                            {fields?.['ATTACHMENT']?.fieldValue || 'Attachment'}
                        </Button>
                        <Button onPress={() => false && showPopup()}
                            style={[styles.btn, { backgroundColor: colors.blue }]} mode="contained" textColor={colors.white} >
                            {fields?.['PAYMENT']?.fieldValue || 'Payment'}
                        </Button>
                        <Button onPress={() => downloadRecord()}
                            style={[styles.btn, { backgroundColor: colors.black }]} mode="contained" textColor={colors.white} >
                            {t('print')}
                        </Button>
                        <Button onPress={() => navigation.navigate('AllInvoicesScreen')}
                            style={[styles.btn, { backgroundColor: colors.danger }]} mode="contained" textColor={colors.white} >
                            {t('CANCEL')}
                        </Button>
                    </View>
                </ScrollView>
                {/* <StructureModal
                    visibilityCheck={isVisible}
                    onClose={(event) => setVisible(false)}
                    modalTitle={fields?.['ATTACHMENT']?.fieldValue || 'Attachment'}
                    RenderContent={() => (
                
                )}
                /> */}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: colors.primary
    },
    card: {
        backgroundColor: colors.white,
        borderBottomColor: colors.secondary,
        borderBottomWidth: 2,
        padding: 7,
        borderRadius: 5,
        marginHorizontal: 10,

    },
    label: {
        color: 'black',
        fontSize: 14,
        letterSpacing: .1,
        flex: 1,
        textAlign: 'left'
    },
    mainCard: {
        gap: 10,
        flexDirection: 'row',
        padding: 7,
    },
    paymentShortText: {
        color: colors.black,
        fontWeight: '500',
        padding: 5,
        paddingHorizontal: 20,
        fontSize: 13
    },
    btn: {
        flex: 1,
        borderRadius: 5,
    },
});

export default EditInvoiceScreen;
