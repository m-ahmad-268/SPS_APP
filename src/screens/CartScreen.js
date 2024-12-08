// /screens/SettingsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { resetLoading, setLoading, } from '../redux/slices/authSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../Utils/colors';
import { IconButton, Button, } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { setScreenFieldsData } from '../services/auth';
import { setCartItems } from '../redux/slices/customerSlice';

const CartScreen = ({ fields, getTotalData, getSaveQuotation }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const currentLanguage = useSelector((state) => state.language.language);
    const { cartItems } = useSelector((state) => state.customer);
    // const [fields, setFields] = useState(null);
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);

    // useFocusEffect(
    //     useCallback(() => {
    //         return () => {
    //             console.log('--------------------------------------HomescreenTriggered unfocused');
    //              // Clean-up or reset logic
    //         };
    //     }, [userProfile])
    // );
    // const setScreenFieldsDataApi = async () => {
    //     try {
    //         const response = await setScreenFieldsData(fields, "M-SPS", "S-PENDING-QUOTATION-FORM", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
    //         setFields(response);
    //         // dispatch(resetLoading());
    //     } catch (error) {
    //         setFields(true);
    //         dispatch(resetLoading());
    //         console.error('Server error:', error);
    //     }
    // }
    const handleDecrement = (id) => {
        dispatch(setCartItems({ action: 'MODIFY_CART', value: { indexOf: cartItems[id].itemNumber, obj: { quantity: cartItems[id].quantity - 1 || 1 } } }));

    };
    const handleIncrement = (id) => {
        dispatch(setCartItems({ action: 'MODIFY_CART', value: { indexOf: cartItems[id].itemNumber, obj: { quantity: cartItems[id].quantity + 1 } } }));

    };



    return (
        <ScrollView style={styles.container}>
            {fields && cartItems.length ? <>
                {cartItems.map((x, i) => (
                    (<View key={`${i}${x.id}`} style={{ borderBottomColor: colors.grey, borderBottomWidth: 1 }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, padding: 15, flexDirection: 'row', alignItems: 'center', }}>
                                <IconButton icon={() => <MaterialIcons name="image" size={30} color={colors.secondary} />} style={{ backgroundColor: colors.white }} size={40}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text style={[{ color: colors.black, padding: 7 }]}>
                                        {currentLanguage == 'ar' ? x?.arabicDescription || '' : x.description || ''}
                                    </Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                        <Text style={{ ...styles.shortText, fontWeight: '500', }}>{fields?.['UOM']?.fieldValue || 'UOM'}: {x?.unit}</Text>
                                        <Text style={{ ...styles.shortText, color: colors.secondary }}>{fields?.['UNIT_PRICE']?.fieldValue || 'Unit Price'}:
                                            {x?.salePrice ? Number(x.salePrice).toFixed(2) : x?.marketPrice ? Number(x.marketPrice).toFixed(2) : Number(x?.unitPrice).toFixed(2) || '-'} </Text>
                                        <View style={styles.quantityContainer}>
                                            <TouchableOpacity
                                                disabled={false}
                                                style={[styles.quantityButton,
                                                false ? { backgroundColor: '#d8d5db', } : { backgroundColor: colors.secondary, }
                                                ]}
                                                onPress={() => cartItems[i].quantity > 1 && handleDecrement(i)}
                                            >
                                                <Text style={styles.buttonText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.quantity}>{x?.quantity}</Text>
                                            <TouchableOpacity
                                                disabled={false}
                                                style={[styles.quantityButton,
                                                false ? { backgroundColor: '#d8d5db', } : { backgroundColor: colors.secondary, }
                                                ]}
                                                onPress={() => handleIncrement(i)}
                                            >
                                                <Text style={styles.buttonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                            </View>
                            <IconButton icon={() => <MaterialIcons name="close" size={20} color={colors.black} />} size={10}
                                onPress={() => dispatch(setCartItems({ action: 'DELETE_CART', value: { index: i } }))} />
                        </View>
                    </View>)
                ))}
                <View style={{ backgroundColor: colors.white, marginVertical: 30 }}>
                    <Text style={{ color: colors.black, fontWeight: 'bold', padding: 15, fontSize: 15 }}>{fields?.['PAYMENT_DETAILS']?.fieldValue || 'Payment Details'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['SUB_TOTAL']?.fieldValue || 'Sub Total'}</Text>
                        <Text style={styles.paymentShortText}>{getTotalData?.dtoSalesTransactionEntry?.subTotal ? Number(getTotalData?.dtoSalesTransactionEntry?.subTotal).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['ITEM_DISCOUNT']?.fieldValue || 'Item Discount'}</Text>
                        <Text style={styles.paymentShortText}>{getTotalData?.dtoSalesTransactionEntry?.itemLevelTD ? Number(getTotalData?.dtoSalesTransactionEntry?.itemLevelTD).toFixed(2) : '0.00'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['TRADE_DISCOUNT']?.fieldValue || 'Trade Discount'}</Text>
                        <Text style={styles.paymentShortText}>{getTotalData?.dtoSalesTransactionEntry?.tradeDiscount ? Number(getTotalData?.dtoSalesTransactionEntry?.tradeDiscount).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['OTHER_EXPENSES']?.fieldValue || 'Other Expense'}</Text>
                        <Text style={styles.paymentShortText}>{getTotalData?.dtoSalesTransactionEntry?.otherExpenses ? Number(getTotalData?.dtoSalesTransactionEntry?.otherExpenses).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['OTHER_EXPENSES_VAT']?.fieldValue || 'Other Expense Vat'}</Text>
                        <Text style={styles.paymentShortText}>{getTotalData?.dtoSalesTransactionEntry?.otherExpensesVat ? Number(getTotalData?.dtoSalesTransactionEntry?.otherExpensesVat).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['VAT']?.fieldValue || 'Vat'}</Text>
                        <Text style={styles.paymentShortText}>{getTotalData?.dtoSalesTransactionEntry?.vatSar ? Number(getTotalData?.dtoSalesTransactionEntry?.vatSar).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopColor: colors.grey, borderTopWidth: .5, padding: 7 }}>
                        <Text style={{ ...styles.paymentShortText, fontWeight: 'bold' }}>{fields?.['TOTAL']?.fieldValue || 'Total'}</Text>
                        <Text style={{ ...styles.paymentShortText, fontWeight: 'bold' }}>{getTotalData?.dtoSalesTransactionEntry?.total ? Number(getTotalData?.dtoSalesTransactionEntry?.total).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ gap: 7, paddingHorizontal: 25, paddingVertical: 10, justifyContent: 'center' }}>
                        {/* <Button style={styles.btn} mode="contained" textColor={colors.secondary} >
                            {fields?.['APPLY_LOYALTY']?.fieldValue || 'Apply Loyality'}
                        </Button>
                        <Button style={styles.btn} mode="contained" textColor={colors.secondary} >
                            {fields?.['COUPON']?.fieldValue || 'Coupon'}
                        </Button> */}
                        <Button onPress={() => getSaveQuotation('save')}
                            style={styles.btn} mode="contained" textColor={colors.secondary} >
                            {t('save')}
                        </Button>
                        <Button onPress={() => getSaveQuotation('submit')}
                            style={styles.btn} mode="contained" textColor={colors.secondary} >
                            {t('submit')}
                        </Button>
                    </View>
                </View>
            </> : <Text style={{ textAlign: 'center', color: colors.black, padding: 15, fontSize: 15 }}>{t('NO_DATA_TO_DISPLAY')}</Text>
            }
            {/* <View style={styles.cardHeader}>
                {(item?.availableQuantity > 0) && <Text style={[{ flex: 1, color: 'green' }]}>{fields?.['IN_STOCK']?.fieldValue || 'In Stock'} </Text>}
                {(item?.availableQuantity == 0 && item?.onOrder == 0) && <Text style={[{ flex: 1, color: colors.red }]}>{fields?.['OUT_OF_STOCK']?.fieldValue || 'Out of Stock'} </Text>}
                {(0 >= item.availableQuantity && item.onOrder > 0) && <Text style={[{ flex: 1, color: colors.black }]}>{fields?.['COMING_SOON']?.fieldValue || 'Coming Soon'} </Text>}
                <IconButton icon={() => <MaterialIcons name="favorite" size={23} color={colors.secondary} />} size={15}
                    onPress={() => console.log("Pressed Favorite btn")} />
            </View>

            {(true) && <Text style={[{ flex: 1, color: 'green' }]}>{item?.availableQuantity} {item.marketPrice}  </Text>}

            <IconButton icon={() => <MaterialIcons name="image" size={40} color={colors.secondary} />} style={{ backgroundColor: colors.primary }} size={50}
                onPress={() => console.log("Pressed Favorite btn")} />
            <Text style={[{ flex: 1, color: colors.black, padding: 10, fontWeight: 'bold' }]}>{item?.itemNumber || 'Items'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        disabled={false}
                        style={[styles.quantityButton,
                        false ? { backgroundColor: '#d8d5db', } : { backgroundColor: colors.secondary, }
                        ]}
                        onPress={() => handleDecrement(index)}
                    >
                        <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item?.quantity || 1}</Text>
                    <TouchableOpacity
                        disabled={false}
                        style={[styles.quantityButton,
                        false ? { backgroundColor: '#d8d5db', } : { backgroundColor: colors.secondary, }
                        ]}
                        onPress={() => handleIncrement(index)}
                    >
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text style={[{ flex: 1, textAlign: 'right', fontWeight: '700', color: colors.secondary }]}>{item?.marketPrice ? t('SAR') + ' ' + Number(item.marketPrice).toFixed(2) : fields?.['NO_PRICE_SET']?.fieldValue || 'No Price Set'}  </Text>
            </View> */}




        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
        backgroundColor: colors.primary,
        flex: 1,
    },
    shortText: {
        padding: 5,
        color: colors.black,
        fontSize: 10
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
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.secondary,
        borderRadius: 5
    },
    quantityContainer: {
        marginVertical: 3,
        flexDirection: 'row',
        // backgroundColor: '#f7f1f1',
        // backgroundColor: 'red',
        // textAlign: 'center',
        // alignSelf: 'flex-end',
    },
    quantityButton: {
        width: 25,
        height: 25,
        // backgroundColor: '#3B2E4A',
        // backgroundColor: '#d8d5db',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
    },
    quantity: {
        marginHorizontal: 10,
        fontSize: 18,
        color: 'black'
    },
});

export default CartScreen;
