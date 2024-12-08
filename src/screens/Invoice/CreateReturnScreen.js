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
import { checkItemAllowToReturn, createReturn, getByCustomerReturnId, getByIdForReturn, submitReturn } from '../../services/drawerService';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
import colors from '../../Utils/colors';
import CustomFlaglist from '../../Shared/CustomFlaglist';
import getEnvVars from '../../Config/env';
import { ShowToastMessage } from '../../Shared/ShowToastMessage';

const CreateReturnScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { imsModuleApiDirectBaseUrl } = getEnvVars();
    const [orderDetail, setOrderDetail] = useState(null);
    const [allData, setAllData] = useState([]);
    const [fields, setFields] = useState(null);
    const [notes, setNotes] = useState('');
    const { id } = route.params || '';
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

    const returnByCustomerId = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const response = await getByCustomerReturnId({ 'id': Number(id.id) }, headers);
            if (response && response?.code == 201 && response?.result) {
                setOrderDetail(response?.result);
                setNotes(response?.result?.notes || '')
                const list = response.result?.details;
                if (list && list?.length) {
                    // assignArray(list);
                    setAllData([...list]);
                }
                dispatch(resetLoading());


            } else {
                dispatch(resetLoading());
            }
        } catch (error) {
            dispatch(resetLoading());
            console.error('getByIdForReturn error:', error);
        }
    };

    const getById = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const response = await getByIdForReturn(id, headers);
            if (response && response?.code == 201 && response?.result) {
                setOrderDetail(response?.result);
                const list = response.result?.details;
                console.log(list.length);
                if (list && list?.length) {
                    // assignArray(list);
                    setAllData([...list]);
                }
                dispatch(resetLoading());


            } else {
                dispatch(resetLoading());
            }
        } catch (error) {
            dispatch(resetLoading());
            console.error('getByIdForReturn error:', error);
        }
    };

    const validateReturningQuantity = async (index) => {
        try {
            if (Number(allData[index].returningQuantity) > (Number(allData[index].oderedQuantity) - Number(allData[index].returnedQuantity))) {
                ShowToastMessage({ message: 'Return Qty cannot be greater than Item Qty', type: 'error' });
                setAllData((prev) => {
                    const updateData = [...prev];
                    updateData[index] = {
                        ...updateData[index],
                        returningQuantity: 0,
                    }
                    return updateData;
                })
            } else {
                if (!allData[index].returningQuantity || Number(allData[index].returningQuantity <= 0)) {
                    setAllData((prev) => {
                        const updateData = [...prev];
                        updateData[index] = {
                            ...updateData[index],
                            returningQuantity: 0,
                        }
                        return updateData;
                    })
                    return
                }
                dispatch(setLoading());
                const headers = await getHeader();
                const response = await checkItemAllowToReturn(allData[index], headers);
                if (response && response.code == 400 || response.code == 302 || response?.code == 423 || response?.code == 409) {
                    ShowToastMessage({ message: response?.btiMessage?.message, type: 'error', message2: 'error' });
                    setAllData((prev) => {
                        const updateData = [...prev];
                        updateData[index] = {
                            ...updateData[index],
                            returningQuantity: 0,
                        }
                        return updateData;
                    })
                }
                dispatch(resetLoading());

            }


        } catch (error) {
            console.log('validateReturningQuantity-----------', error);
            dispatch(resetLoading());

        }
    };

    const saveReturn = async (event) => {
        try {
            dispatch(setLoading());
            console.log(event);
            const headers = await getHeader();
            let list = [];
            if (allData && allData?.length) {
                allData.map((element) => {
                    if (element?.returningQuantity && element?.returningQuantity > 0)
                        list.push(element);

                });
                const body = {
                    ...orderDetail,
                    details: list,
                    notes: notes,
                    orderType: Number(4),
                }
                if (!list.length) {
                    ShowToastMessage({ message: 'Please Add any Item for Return', type: 'error', message2: t('error') });
                }
                const response = event == 'save' ? await createReturn(body, headers) : await submitReturn(body, headers);
                if (response && response.code != 201) {
                    ShowToastMessage({ message: response?.btiMessage?.message, type: 'error', message2: t('error') });
                    // setAllData((prev) => {
                    //     const updateData = [...prev];
                    //     updateData[index] = {
                    //         ...updateData[index],
                    //         returningQuantity: '0',
                    //     }
                    //     return updateData;
                    // })
                } else if (response && response.code == 201) {
                    ShowToastMessage({ message: response?.btiMessage?.message, type: 'success', message2: t('success') });
                }
                dispatch(resetLoading());



            }

        } catch (error) {
            console.log('createReturn --------------', error);
            dispatch(resetLoading());

        }
    };

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-INVOICES-RETURN-FORMS", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    };

    useEffect(() => {
        console.log('-------------------------CreateReturnScreen Entrances-----------------', id);
        setScreenFieldsDataApi();
        if (id.status) {
            returnByCustomerId();
        } else {
            getById();
        }
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
            <CustomHeader navigation={navigation} headerTitle={id?.status ? fields?.['EDIT_RETURN']?.fieldValue || 'Edit Return' : fields?.['CREATE_RETURN']?.fieldValue || 'Create Return'} />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['REFERENCE_NO']?.fieldValue || 'Refrence No.'}</Text>
                            <Text style={styles.label}>{orderDetail?.referenceNo || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['SHIPMENT_DATE']?.fieldValue || 'Shipment Date'}</Text>
                            <Text style={styles.label}>{orderDetail?.dtoSalesTransactionEntry?.customerShipmentDate || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['EXPIRY_DATE']?.fieldValue || 'Expected Shipment Date'}</Text>
                            <Text style={styles.label}>{orderDetail?.expiryDate || 'N/A'}</Text>
                        </View>
                        <View style={styles.mainCard}>
                            <Text style={{ ...styles.label, fontWeight: 'bold', }}>{fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address'}</Text>
                            <Text style={styles.label}>{orderDetail?.shippingAddress || 'N/A'}</Text>
                        </View>
                    </View>

                    {!!(allData?.length) && allData.map((item, index) => (
                        <View key={`${item.item.itemNumber}${index}`} style={styles.mainItemCard}>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['ITEM_NUMBER']?.fieldValue || 'item Number'}</Text>
                                <Text style={styles.itemLabel}>{item?.item?.itemNumber}</Text>
                            </View>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['DESCRIPTION']?.fieldValue || 'Description'}</Text>
                                <Text style={styles.itemLabel}>{item.item.description} </Text>
                            </View>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['UOM']?.fieldValue || 'UOM'}</Text>
                                <Text style={styles.itemLabel}>{item?.unitOfMeasureScheduleId?.unitOfMeasureId} </Text>
                            </View>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['ORDER_QTY']?.fieldValue || 'Order Qty'}</Text>
                                <Text style={styles.itemLabel}>{item?.oderedQuantity} </Text>
                            </View>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['RETURNING_QUANTITY']?.fieldValue || 'Returning Quantity'}</Text>
                                <TextInput style={styles.input}
                                    keyboardType="phone-pad"
                                    placeholderTextColor={colors.lightgrey}
                                    value={String(item.returningQuantity)}
                                    onBlur={() => validateReturningQuantity(index)}
                                    onChangeText={(text) =>
                                        setAllData((prev) => {
                                            // Create a new array with the updated value
                                            const updatedData = [...prev];
                                            updatedData[index] = {
                                                ...updatedData[index], // Keep other properties intact
                                                returningQuantity: text, // Update the specific field
                                            };
                                            return updatedData; // Return the updated array
                                        })
                                    }
                                />
                            </View>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['RETURNED_QUANTITY']?.fieldValue || 'Returned Quantity'}</Text>
                                <Text style={styles.itemLabel}>{item?.returnedQuantity || '0'} </Text>
                            </View>
                            <View style={styles.itemCard}>
                                <Text style={styles.itemLabel}>{fields?.['REJECTED_QTY']?.fieldValue || 'Rejected Quantity'}</Text>
                                <Text style={styles.itemLabel}>{item?.rejectedQuantity || '0'} </Text>
                            </View>
                        </View>
                    ))}


                    {/* {fields && <CustomFlaglist listData={allData} getId={() => false}
                        buttonTitle={{
                            show: false,
                            nestedScrollCheck: false,
                        }} />} */}

                    <View style={{ gap: 7, margin: 10, }}>
                        <Text style={styles.label}> {fields?.['NOTES']?.fieldValue} </Text>
                        <TextInput style={{ ...styles.input, marginBottom: 20, }}
                            placeholderTextColor={colors.lightgrey}
                            value={notes}
                            onChangeText={setNotes}
                        />
                        <Button onPress={() => saveReturn('save')}
                            style={[styles.btn, { backgroundColor: colors.success }]} mode="contained" textColor={colors.white} >
                            {t('save')}
                        </Button>
                        <Button onPress={() => saveReturn('submit')}
                            style={[styles.btn, { backgroundColor: colors.blue }]} mode="contained" textColor={colors.white} >
                            {t('submit')}
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
        borderColor: colors.secondary,
        borderWidth: 1,
        padding: 7,
        borderRadius: 5,
        marginHorizontal: 10,
        marginBottom: 10,

    },
    mainItemCard: {
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: colors.white,
        elevation: 2,
        borderRadius: 5,
        padding: 5,
        gap: 3,
    },
    itemCard: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    itemLabel: {
        color: 'black',
        fontSize: 14,
        flex: 1,
        textAlign: 'left'
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
    input: {
        flex: 1,
        paddingHorizontal: 10,
        borderColor: colors.grey,
        color: colors.black,
        borderWidth: .5,
        borderRadius: 5,
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
        marginHorizontal: 25,
    },
});

export default CreateReturnScreen;