import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text, TextInput, Easing, ScrollView, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { useFocusEffect } from '@react-navigation/native';
import { resetLoading, setLoading, setToken } from '../../redux/slices/authSlice';
import { setScreenFieldsData } from '../../services/auth';
import {
    userActivity, calculateBill,
    findCustomerByCustomerId,
    requestPrioritiesForDropDown,
    shippingAddressByCustomer,
    create, submit, getDetailsByCustomerOrderId,
    cencelOrderOrQuotation,
    createTransactionEntry,
    getCustomerByEmail,
    getCustomerAccountDetailByCustomerId,
    submitForClient,
    getById,
    getQuotationById,
    approveQuotation,
    postSaleAndSaleReturnData,
    validateQuantityBeforeSubmit,
} from '../../services/drawerService';
import Toast from 'react-native-toast-message';
import ItemFilter from '../../Shared/ItemFilter';
import { ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { setCartItems, setCartVisible } from '../../redux/slices/customerSlice';
import CartScreen from '../CartScreen';
import StructureModal from '../../Shared/structureModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import Collapsible from 'react-native-collapsible';
import colors from '../../Utils/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import CustomFlaglist from '../../Shared/CustomFlaglist';
import RNFetchBlob from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import getEnvVars from '../../Config/env';
import CustomPopup from '../../Shared/CustomPopup';
import { ShowToastMessage } from '../../Shared/ShowToastMessage';

const QuotationFormScreen = ({ navigation, route }) => {
    const { imsModuleApiDirectBaseUrl, salesModuleApiBaseUrl } = getEnvVars();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const currentRouteName = route.name;
    const { id, status } = route.params || '';
    const [fields, setFields] = useState(null);
    const [totalResponse, setTotalResponse] = useState(null);
    const [detailById, setDetailById] = useState(null);
    const [allCartData, setAllCartData] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const currentLanguage = useSelector((state) => state.language.language);
    const { cartItems, isVisible } = useSelector(state => state.customer);
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [reason, setReason] = useState('');
    const [showReason, setShowReason] = useState(false);
    const [userActivityData, setUserActivity] = useState({});

    const showPopup = () => setPopupVisible(true);
    const hidePopup = () => setPopupVisible(false);
    const getReason = async () => {
        try {
            if (!reason) {
                return
            }
            const header = await getHeader();
            const reqBody = {
                "id": id,
                "orderCencelReason": reason,
                "orderCancelFrom": 'QUOTATION'
            }
            const response = await cencelOrderOrQuotation(reqBody, header);
            if (response && response?.code == 200) {
                setShowReason(false);
                setReason('');
                dispatch(setToken());
            }
            const msg = response?.code == 200 ? 'success' : 'error';
            ShowToastMessage({ message: response?.btiMessage?.message, message2: t(msg), type: msg })
        } catch (error) {
            console.error('getReason------------------', error);
            dispatch(resetLoading());
        }
    };

    const handleConfirm = (event) => {
        hidePopup();
        if (status && status != 'DRAFT') {
            setReason('');
            setShowReason(true);
        } else {
            createQuotation('confirm');
        }
    };

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());
    const [shipmentDate, setShipmentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showShipDatePicker, setShowShipDatePicker] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [activeShipAddress, setActiveShipAddress] = useState(null);
    const [formValidityChk, setFormValidityChk] = useState(false);
    const [shipmentDropOpen, setShipmentDropOpen] = useState(false);
    const [arrShipAddress, setArrShipAddress] = useState([]);
    const [customerDetail, setCustomerDetail] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownValue, setDropdownValue] = useState(null);
    const [dropdownItems, setDropdownItems] = useState([]);
    const [notes, setNotes] = useState('');
    const slideAnim = useRef(new Animated.Value(0)).current; // Slide animation value (0 = hidden, 1 = visible)

    const toggleView = () => {
        // If the view is collapsed, expand it, otherwise collapse it
        Animated.timing(slideAnim, {
            toValue: isCollapsed ? 1 : 0, // 1 for visible, 0 for hidden
            duration: 300, // Duration of the animation
            useNativeDriver: true, // Use native driver for better performance
            easing: Easing.ease, // Optional easing function
        }).start();

        setIsCollapsed(!isCollapsed); // Toggle collapsed state
    };

    // Interpolate the slideAnim value to get a translateY animation
    const slideInterpolation = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-500, 0], // Adjust 300 to however far you want it to slide up/down
    });

    const toggleAccordion = () => {
        setIsCollapsed(!isCollapsed);
    };

    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return {
            langid: lngId, 'content-type': 'application/json',
            userid: String(userProfile?.userId), session: userProfile?.session, tenantid: userProfile?.tenantid
        };
    }

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-PENDING-QUOTATION-FORM", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);
            // dispatch(resetLoading());
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    }

    useEffect(() => {
        setFormValidityChk(false);
        setDropdownItems([]);
        setArrShipAddress([]);
        setDropdownOpen(false);
        setShipmentDropOpen(false);
        setScreenFieldsDataApi();
        setShowShipDatePicker(false);
        setShowDatePicker(false);
        getCustomerDetail();
        prioritiesForDropDown();
        getShippingAddressByCustomer();
        setTotalResponse(null);

        if (id) {
            DetailsByCustomerOrderId();
            setIsCollapsed(false);
            // setDropdownValue('2');
        } else {
            setDropdownValue(null);
            setActiveShipAddress(null);
            setDate(new Date());
            setShipmentDate(new Date());
        }

        // fetchData();

    }, []);

    const DetailsByCustomerOrderId = async () => {
        try {
            dispatch(setLoading());
            setAllCartData([]);
            const headers = await getHeader();
            const resData = await getDetailsByCustomerOrderId({ id: id }, headers);
            // console.log(resData);
            if (resData && (resData.code == 201 || resData.code == 200) && resData?.result) {
                const data = resData?.result;
                // setDate(moment(data.transactionDate, 'DD/MM/YYYY').toDate())
                setDetailById(data);
                setShipmentDate(moment(data.shipmentDate, 'DD/MM/YYYY').toDate())
                setActiveShipAddress(data?.shippingAddressId || null);
                setIsChecked(data?.getItTogether || false);
                setDropdownValue(data.dtoRequestPriority?.id || dropdownItems[2].value)
                // dispatch(setCartItems({ action: 'ADD_TO_CART_LIST', value: [] }))
                if (data.status == 'SUBMITTED' || data.status == 'CANCEL' || data.status == 'APPROVED')
                    setTotalResponse(data);

                resData.result?.details.length && resData.result?.details.map((x, index) => {
                    // const obj = { ...x, quantity: x.quantity || x.oderedQuantity, }
                    const rand = Math.random() * (100 - 1 + 1) + 1;
                    const temp = {
                        'id': x.item.id,
                        'itemCode': x.item.itemNumber,
                        'itemNumber': x.item.itemNumber,
                        'description': x.item.description,
                        'arabicDescription': x.item.arabicDescription,
                        'unit': x.unit,
                        'quantity': x.oderedQuantity,
                        'basedOfMeasureName': x.basedOfMeasureName,
                        'baseQuantity': x.baseQuantity,
                        'currencyDecimals': x.currencyDecimals,
                        'quantityDecimals': x.quantityDecimals,
                        'unitPrice': x.unitPrice,
                    }
                    if (data.status == 'DRAFT') {
                        dispatch(setCartItems({ action: 'ADD_TO_CART', value: temp }))
                    } else if (data.status == 'SUBMITTED' || data.status == 'CANCEL' || data.status == 'APPROVED') {
                        let obj = {
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
                                    rowTitle: fields?.['ITEM_CODE']?.fieldValue || 'Item Code',
                                    rowValue: x?.item?.itemNumber || x?.item?.itemCode,
                                },
                                {
                                    show: true,
                                    rowTitle: fields?.['DESCRIPTION']?.fieldValue || 'Description',
                                    rowValue: x?.item?.description,
                                },
                                {
                                    show: true,
                                    rowTitle: fields?.['UOM']?.fieldValue || 'UOM',
                                    rowValue: x.basedOfMeasureName,
                                },
                                // {
                                //     show: x?.startTime ? true : false,
                                //     rowTitle: 'Reservation Time',
                                //     rowValue: x?.startTime ? convertTo12HourFormat(x?.startTime) : null,
                                // },
                                {
                                    show: true,
                                    rowTitle: fields?.['QUANTITY']?.fieldValue || 'Quantity',
                                    rowValue: !!(x?.oderedQuantity) && (x?.oderedQuantity).toFixed(2),
                                },
                                {
                                    show: true,
                                    rowTitle: fields?.['UNIT_PRICE']?.fieldValue || 'Unit Price',
                                    rowValue: !!(x?.unitPrice) && (x?.unitPrice).toFixed(0),
                                },
                                {
                                    show: true,
                                    rowTitle: fields?.['SUB_TOTAL']?.fieldValue || 'Sub Total',
                                    rowValue: !!(x?.oderedQuantity && x?.unitPrice) && (x?.oderedQuantity * x?.unitPrice).toFixed(2),
                                },
                            ],
                            btnArray: [
                                {
                                    title: t('delete'),
                                    type: 'delete',
                                    disable: true,
                                },
                            ]
                        }
                        setAllCartData(prev => [...prev, obj])
                    }
                    dispatch(resetLoading());
                })
                // console.log('ADD_TO_CART_LIST', resData.result?.details[0]);

            }

        } catch (error) {
            console.log('Error in DetailsByCustomerOrderId', error);

        }

    };

    const downloadRecord = async (recordId) => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const reqBody = {
                hideItemNumber: false,
                id: Number(recordId),
                landscape: false,
                printQtyandRate: false,
                printedByName: userProfile.firstName + ' ' + userProfile.lastName,
                showExpenses: false,
                showHeaderAndFooter: true,
                showItemWithZeroQtyInQuotation: "yes"
            };

            const downloadDest = `${RNFetchBlob.fs.dirs.DownloadDir}/invoice_${recordId}.pdf`;
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

    const downloadRecordTemplate = async (check) => {
        try {
            // dispatch(setLoading());
            const headers = await getHeader();
            const reqBody = {
                custNumber: userProfile?.customerNo,
                template: check
            };
            const randomValue = Math.floor(Math.random() * 101);
            const downloadDest = `${RNFetchBlob.fs.dirs.DownloadDir}/${'template_' + randomValue}`;
            let response = await RNFetchBlob.config({
                fileCache: true,
                // appendExt: 'pdf',
                path: downloadDest,
            })
                .fetch('POST', `${salesModuleApiBaseUrl}/customerOrder/downloadCustomerCatalogue`, headers, JSON.stringify(reqBody))
                .then((res) => {
                    console.log('File downloaded to:', res.path());
                    // setFilePath(res.path());
                    return res;
                });

            await FileViewer.open(response.path())
                .then(() => {
                    dispatch(resetLoading());
                    console.log('File opened successfully');
                })
                .catch((error) => {
                    dispatch(resetLoading());
                    console.error('Error opening file:', error);
                });

        } catch (error) {
            console.error("Error saving downloadRecordTemplate:", error);
            dispatch(resetLoading());
        }

    };

    const getShippingAddressByCustomer = async () => {
        try {
            const headers = await getHeader();
            const resData = await shippingAddressByCustomer({ customerId: userProfile.customerNo }, headers);
            if (resData && (resData.code == 200 || resData.code == 201) && resData?.result && resData?.result?.length) {
                const arr = resData?.result.map(x => {
                    return {
                        ...x,
                        label: x.shippingAddress1 + ', ' + x.cityName + ', ' + x.stateName + ', ' + x.countryName,
                        value: x?.id
                    }
                })
                setArrShipAddress([...arr]);
            }

        } catch (error) {
            console.log('Error in GEtting getShippingAddressByCustomer Detail', error);
        }

    }
    const prioritiesForDropDown = async () => {
        try {
            const headers = await getHeader();
            const resData = await requestPrioritiesForDropDown({}, headers);
            if (resData && resData.code == 302 && resData?.result) {
                const arr = resData?.result.map(x => {
                    return {
                        ...x,
                        label: x?.description,
                        value: x?.id
                    }
                })
                setDropdownItems([...arr]);
                setDropdownValue(arr[2].value);
            }

        } catch (error) {
            console.log('Error in GEtting prioritiesForDropDown Detail', error);
        }

    }

    const getCustomerDetail = async () => {
        try {
            const headers = await getHeader();
            const resData = await findCustomerByCustomerId(userProfile.customerNo, headers);
            if (resData && resData.code == 200 && resData?.result) {
                setCustomerDetail({ ...resData.result });
            }

        } catch (error) {
            console.log('Error in GEtting Customer Detail', error);
            // dispatch(resetLoading());
        }

    }

    const createQuotation = async (event) => {
        try {

            if (event == 'submit') {
                showPopup();
                return
            }

            if (!activeShipAddress || !dropdownValue) {
                dispatch(setCartVisible(false));
                setIsCollapsed(false);
                setFormValidityChk(true);
                Toast.show({
                    type: 'error', // 'error', 'info' can also be used
                    text1: t('PLEASE_FILL_COMPLETE_DATA'),
                    text2: t('error'),
                });
                return
            }

            dispatch(setLoading());
            setFormValidityChk(false);
            dispatch(setCartVisible(false));
            setIsCollapsed(true);
            // if (id) {
            //     const tempDetail = await cartItems.map(x => {
            //         return {
            //             item: { ...x, baseQuantity: String(x.quantity), basedOfMeasureName: x.unit },
            //             oderedQuantity: x.quantity,
            //             unit: x.unit,
            //             status: x?.status || null,
            //             currencyDecimals: x?.currencyDecimals,
            //             quantityDecimals: x?.quantityDecimals,
            //         }

            //     })
            // } else {
            // }
            const tempDetail = await cartItems.map(x => {
                return {
                    item: { ...x, baseQuantity: String(x.quantity), basedOfMeasureName: x.unit },
                    oderedQuantity: x.quantity,
                    unit: x.unit,
                    status: x?.status || null,
                    currencyDecimals: x?.currencyDecimals,
                    quantityDecimals: x?.quantityDecimals,
                }

            })
            // dispatch(setLoading());
            const body = {
                ...detailById,
                details: [...tempDetail],
                shippingAddressId: activeShipAddress,
                dtoRequestPriority: dropdownItems.length ? dropdownItems.find(x => x.id == dropdownValue) : null,
                discountAmount: totalResponse?.dtoSalesTransactionEntry?.tradeDiscount || 0,
                loyalityDiscountAmount: false ? this.LoyaltyAmountToShow : 0,
                couponDiscountAmount: false ? this.couponFinalAmnt : 0,
                customerPurchaseOrder: '',
                getItTogether: isChecked,
                orderType: '1',
                childCustomerEmail: userProfile.email,
                customer: {
                    name: userProfile.secondaryFullName,
                    custnumber: userProfile.customerNo,
                },
                shipmentDate: shipmentDate.toLocaleDateString(),
                site: {},
                siteId: userProfile.siteId,
                transactionDate: date.toLocaleDateString(),
                salesmanId: customerDetail?.salesmanIndexId,
                customerId: userProfile.customerNo,
                shippingAddress: customerDetail?.shippingAddress || '',
                shippingAddress2: customerDetail?.shippingAddress || '',
                shippingAddress3: customerDetail?.billingAddress || '',
                billingAddress: customerDetail?.shippingAddress || '',
                billingAddress2: customerDetail?.billingAddress || '',
                billingAddress3: customerDetail?.billingAddress || '',
                dtoSalesTransactionEntry: { ...totalResponse?.dtoSalesTransactionEntry }
            };
            // console.log('body------------------------------saved---', JSON.stringify(body));

            const headers = await getHeader();
            const response = event == 'save' ? await create(body, headers) : await validateQuantityBeforeSubmit(body, headers);
            if (response.code == 201 || response?.code == 200) {
                if (event == 'save') {

                    navigation.navigate('AllQuotationScreen');
                    dispatch(setCartItems({ action: 'EMPTY_CART' }));
                    dispatch(setToken());
                    const type = response.code == 201 ? 'success' : 'error';
                    ShowToastMessage({ message: response?.btiMessage?.message, message2: t(type), type: type });
                } else {
                    const data = await submit(body, headers);
                    if (data && data.code == 201) {
                        saveUserActivity(data?.result?.id, null, 'QUOTATION SUBMITTED');
                        if (data?.result?.notCreatedSalesTransactions && data?.result?.notCreatedSalesTransactions.length > 0) {
                            const obj = data.result.notCreatedSalesTransactions[0];
                            createSalesTransaction(obj, data.result, headers);
                        }
                    }
                }

            }
        } catch (error) {
            console.log('Error in Creating Quotation', error);
            dispatch(resetLoading());
        }
    };

    const createSalesTransactionAfterApprove = async (obj, parentResult, index, arrayLength, header) => {
        const elm = await createTransactionEntry(obj, header);
        if (elm.code == 201) {
            let obj2 = parentResult;
            obj2.dtoSalesTransactionEntry = elm.result;
            const res = await submitForClient(obj2, header);
            console.log('hellloWhrererere', res);
            if (res.code == 201) {
                if (index == arrayLength) {


                    // const randomValue = Math.floor(Math.random() * 99) + 2;
                    // // Update the refreshGrid value with the random number
                    // this.customerOrderService.refreshGrid.next(randomValue);
                }
                // const type = res.code == 201 ? 'success' : 'error';
                // ShowToastMessage({ message: res?.btiMessage?.message, message2: t(type), type: type });
                // Utils.hideLoader('.main-card');
            }
        }
    };

    const createSalesTransaction = async (obj, parentResult, header) => {
        try {
            const resData = await createTransactionEntry(obj, header);
            if (resData.code == 201) {
                dispatch(setCartItems({ action: 'EMPTY_CART' }));
                navigation.navigate('AllQuotationScreen');
                dispatch(setToken());

                let obj2 = parentResult;
                obj2.dtoSalesTransactionEntry = resData?.result;
                const cusObj = await getCustomerAccountDetailByCustomerId({ customerId: userProfile?.customerNo }, header);
                if (cusObj.code == 200) {
                    obj2.creditLimit = cusObj?.result.creditLimit;
                    obj2.creditLimitAmount = cusObj?.result.creditLimitAmount;
                    obj2.openingBalance = cusObj?.result.openingBalance;
                } else {
                    obj2.creditLimit = 0;
                    obj2.creditLimitAmount = 0;
                    obj2.openingBalance = 0;
                }
                // console.log('cusObj----------------', obj2);
                const res = await submitForClient(obj2, header);
                if (res.code == 201) {
                    if (res?.result?.autoPost) {
                        const saleRes = await getById({ id: obj2.dtoSalesTransactionEntry.id });
                        if (saleRes.code == 200 && saleRes.result.records[0] != undefined) {
                            let postObj = { ...saleRes.result.records[0] };
                            postObj.postedDate = formattedDate;
                            const data = postSaleAndSaleReturnData(postObj, header);
                            if (data.result.customerOrderId != null) {
                                let approveGetByIdObj = {};
                                const innerData = getQuotationById({ id: data.result.customerOrderId }, header);
                                if (innerData.result) {
                                    approveGetByIdObj = innerData.result;
                                    approveGetByIdObj.dtoSalesTransactionEntry.salesTransactionEntryGridList.forEach((forElm) => {
                                        forElm.spsSelected = true;
                                    });
                                    const approveObj = approveQuotation(approveGetByIdObj, header);
                                    if (approveObj?.result?.notCreatedCustomerOrders && approveObj.result.notCreatedCustomerOrders.length > 0) {
                                        approveObj.result.notCreatedCustomerOrders.forEach((element, i) => {
                                            const obj = element;
                                            const obj1 = obj.notCreatedSalesTransactions[0];
                                            createSalesTransactionAfterApprove(obj1, obj, i + 1, approveObj.result.notCreatedCustomerOrders.length, header);
                                        });
                                        console.log('mai idr h ----------------------------1');
                                    } else {
                                        // const randomValue = Math.floor(Math.random() * 99) + 2;
                                        // this.customerOrderService.refreshGrid.next(randomValue);
                                        console.log('mai idr h ----------------------------2');
                                    }
                                    console.log('mai idr h ----------------------------3');

                                }
                                // const type = data.code == 201 ? 'success' : 'error';
                                // ShowToastMessage({ message: data?.btiMessage?.message, message2: t(type), type: type });
                            }
                        }
                    } else if (res.result.notCreatedCustomerOrders && res.result.notCreatedCustomerOrders.length > 0) {
                        console.log('tum kdr kladjksdlj --------------');
                        // res.result.notCreatedCustomerOrders.forEach((element, i) => {
                        //     const obj = element;
                        //     const obj1 = obj.notCreatedSalesTransactions[0];
                        //     this.createSalesTransaction1(obj1, obj, i + 1, res.result.notCreatedCustomerOrders.length);
                        // });
                    } else {
                        console.log('yoo Bhai-------------------------12');
                        // const randomValue = Math.floor(Math.random() * 99) + 2;
                        // // Update the refreshGrid value with the random number
                        // this.customerOrderService.refreshGrid.next(randomValue);
                        // const type = res.code == 201 ? 'success' : 'error';
                        dispatch(setToken());
                        // ShowToastMessage({ message: res?.btiMessage?.message, message2: t(type), type: type });
                        // this.location.back();
                    }
                }

            } else {
                dispatch(resetLoading());
                const type = resData.code == 201 ? 'success' : 'error';
                ShowToastMessage({ message: resData?.btiMessage?.message, message2: t(type), type: type });
            }

        }
        catch (error) {
            console.error('createSalesTransaction--', error);
            dispatch(resetLoading());
        }
    };

    const getCalculateBill = async () => {
        try {
            const tempDetail = await cartItems.map(x => {
                return {
                    item: { ...x, baseQuantity: String(x.quantity), basedOfMeasureName: x.unit },
                    oderedQuantity: x.quantity,
                    status: null,
                }

            })
            const body = {
                // shippingAddressId: this.activeShippingAddress.length > 0 ? this.activeShippingAddress[0].id : null,
                shippingAddressId: activeShipAddress || null,
                details: tempDetail,
                shipmentDate: shipmentDate.toLocaleDateString(),
                site: {},
                siteId: userProfile.siteId,
                transactionDate: date.toLocaleDateString(),
                orderType: '1',
                getItTogether: isChecked,
                salesmanId: customerDetail?.salesmanIndexId,
                // dtoRequestPriority: dropdownValue || null,
                dtoRequestPriority: dropdownItems.length ? dropdownItems.find(x => x.id == dropdownValue) : null,
                customer: {
                    name: userProfile.secondaryFullName,
                    custnumber: userProfile.customerNo,
                },
                customerId: userProfile.customerNo,
                shippingAddress: customerDetail?.shippingAddress || '',
                shippingAddress2: customerDetail?.shippingAddress || '',
                shippingAddress3: customerDetail?.billingAddress || '',
                billingAddress: customerDetail?.shippingAddress || '',
                billingAddress2: customerDetail?.billingAddress || '',
                billingAddress3: customerDetail?.billingAddress || '',

            };
            // console.log('body', JSON.stringify(body));
            const headers = await getHeader();
            const resData = await calculateBill(body, headers);
            if (resData && resData?.code == 200 && resData?.result) {
                // console.log('resData------------', resData?.result);
                dispatch(resetLoading());
                setTotalResponse(resData?.result);
            } else {
                dispatch(resetLoading());
            }


        } catch (error) {
            console.log('getCalculateBillIn Error---------------', error);
            dispatch(resetLoading());

        }
    }

    const onCloseCart = () => {
        console.log('hello');
        dispatch(setCartVisible(false));

    }

    useEffect(() => {
        if (isVisible && cartItems.length) {
            dispatch(setLoading());
            console.log('Chaloo-----------KRo calculate-----------------', isLoading);
            getCalculateBill();

        }
        // fetchData();

    }, [isVisible, cartItems]);
    const onClickedId = async (event) => {
        saveUserActivity(null, event, 'ADD TO CART');

        const reqBody = {
            ...event,
            unit: event?.dtoUnitOfMeasureScheduleSetupDetail && event.dtoUnitOfMeasureScheduleSetupDetail?.length ? event.dtoUnitOfMeasureScheduleSetupDetail[0]?.unitOfMeasureObj?.unitOfMeasureId : '',
            quantity: event?.quantity || 1,
            baseOfUOFMId: event?.dtoUnitOfMeasureScheduleSetupDetail && event.dtoUnitOfMeasureScheduleSetupDetail?.length ? event.dtoUnitOfMeasureScheduleSetupDetail[0]?.unitOfMeasureObj?.id : ''
        }

        if (cartItems.length) {
            const obj = cartItems.find(x => x.itemNumber == event.itemNumber);
            if (obj) {
                Toast.show({
                    type: 'success', // 'error', 'info' can also be used
                    text1: t('Item Already Added In Cart'),
                    text2: t('success'),
                });
                return;
            }
        }
        // console.log('Onclicked Carrt Quotation', reqBody);
        dispatch(setCartItems({ action: 'ADD_TO_CART', value: reqBody }));
        try {

        } catch (error) {
            console.log('Onclicked Carrt Quotation', error);
            dispatch(resetLoading());

        }

    };

    const getClickedId = (event) => {
        // console.log(event);

    };

    userActivityResponse: any = {};
    // const saveUserActivity = async (event: any, removeItem: boolean = false) {
    const saveUserActivity = async (referenceId, activeItem, actionType) => {
        try {
            const headers = await getHeader();
            let dtoUserActivityDetailsList;
            if (actionType == 'ADD TO CART') {
                dtoUserActivityDetailsList = [
                    {
                        "actionInPage": "",
                        "itemNumber": activeItem.itemNumber ? activeItem.itemNumber : activeItem.itemCode,
                        "quantity": activeItem.quantity || 1,
                        "amountSpent": 0.0,
                        "comments": "",
                        "removeItem": false
                    }
                ]
            }
            else if (actionType == 'QUOTATION SUBMITTED') {
                dtoUserActivityDetailsList = cartItems.map((item, index) => {
                    return {
                        "actionInPage": "",
                        "itemNumber": item?.itemNumber || item?.itemCode,
                        "quantity": item?.quantity,
                        "amountSpent": item?.unitPrice || 0.00,
                        "comments": "",
                        "removeItem": false
                    }
                });
            }
            const body = {
                "customerNumber": userProfile.customerNo,
                "actionType": actionType,
                "pageVisited": "QUOTATION",
                "comments": notes,
                "childCustomerEmail": userProfile.email,
                "reference": referenceId || null,
                "id": userActivityData?.id || id || null,
                //     "id": this.userActivityResponse && this.userActivityResponse.id != undefined ? this.userActivityResponse.id : null,
                //     "reference": this.userActivityResponse && this.userActivityResponse.id != undefined ? null : !!this.orderId ? this.orderId : null,
                "dtoUserActivityDetails": dtoUserActivityDetailsList,
            }

            console.log(body);

            const resData = await userActivity(body, headers);
            if (resData.code == 201) {
                setUserActivity(resData.result);
            }

        } catch (error) {
            console.log('savUserItem error', error);
            dispatch(resetLoading());

        }
    };

    return (
        <>
            <CustomHeader navigation={navigation} headerTitle={!id ? fields?.['REQUEST_FOR_QUOTATION']?.fieldValue || 'Request For Quotation' : fields?.['EDIT_QUOTATION']?.fieldValue || 'Edit Quotation'} />
            {/* <IconButton icon={() => <MaterialIcons name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{}} color={colors.secondary} />}
                    onPress={() => console.log("Pressed Favorite btn")} /> */}

            <View style={{ backgroundColor: colors.primary, flexDirection: 'row', padding: 5, flexWrap: 'wrap', gap: 5 }}>
                <Button onPress={() => downloadRecordTemplate(true)}
                    style={[styles.btn, { backgroundColor: colors.secondary }]} mode="contained" textColor={colors.white} >
                    {fields?.['TEMPLATE']?.fieldValue || 'Template'}
                </Button>
                <Button onPress={() => downloadRecordTemplate(false)}
                    style={[styles.btn, { backgroundColor: colors.secondary }]} mode="contained" textColor={colors.white} >
                    {fields?.['DOWNLOAD']?.fieldValue || 'Download'}
                </Button>
                <Button onPress={() => false}
                    style={[styles.btn, { backgroundColor: colors.secondary }]} mode="contained" textColor={colors.white} >
                    {fields?.['Import']?.fieldValue || 'Import'}
                </Button>
            </View>

            <View style={styles.accordianContainer}>
                {/* Accordion Header */}
                <TouchableOpacity onPress={toggleView} style={styles.accordionHeader}>
                    <Text style={styles.accordionTitle}><Text style={{ fontWeight: 'bold' }}>{fields?.['TRANSACTION_DATE']?.fieldValue || 'Transaction Date'}</Text>: {formattedDate} </Text>
                    <MaterialIcons name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{}} color={colors.secondary} />
                </TouchableOpacity>

                {/* Accordion Content */}
                {/* {!isCollapsed && <View style={{}} collapsed={isCollapsed}> */}
                {/* <Animated.View
                    style={{
                        transform: [{ translateY: slideInterpolation }],
                        opacity: 1,
                    }}
                > */}
                {!isCollapsed && <View style={styles.accordionContent}>
                    {/* Date Picker */}
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        <TouchableOpacity onPress={() => false && setShowDatePicker(true)} style={{ flex: 1 }}>
                            <Text style={styles.label}>{fields?.['TRANSACTION_DATE']?.fieldValue || 'Transaction Date'}</Text>
                            <TextInput
                                style={{ ...styles.input, color: colors.grey }}
                                value={date.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                // onChange={onDateChange}
                                onChange={(event, selectedDate) => {
                                    if (event.type === 'set') {  // Ensure that a date was selected
                                        const currentDate = selectedDate || date;
                                        setShowDatePicker(false); // Hide the picker
                                        setDate(currentDate); // Update the selected date
                                    } else if (event.type === 'dismissed') { // Handle picker dismissal
                                        setShowDatePicker(false); // Close the picker when dismissed
                                    }
                                }}
                            />
                        )}
                        <TouchableOpacity style={{ flex: 1 }}
                            onPress={() => setShowShipDatePicker(true)}>
                            <Text style={styles.label}>{fields?.['SHIPMENT_DATE']?.fieldValue || 'Shipment Date'}</Text>
                            <TextInput
                                style={styles.input}
                                value={shipmentDate.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>
                        {showShipDatePicker && (
                            <DateTimePicker
                                borderColor={'red'}
                                value={shipmentDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (event.type === 'set') {  // Ensure that a date was selected
                                        const currentDate = selectedDate || shipmentDate;
                                        setShowShipDatePicker(false); // Hide the picker
                                        setShipmentDate(currentDate); // Update the selected date
                                    } else if (event.type === 'dismissed') { // Handle picker dismissal
                                        setShowShipDatePicker(false); // Close the picker when dismissed
                                    }
                                }}
                            />
                        )}
                    </View>
                    <View>
                        {/* Dropdown */}
                        <View>
                            <Text style={styles.label}>{fields?.['PRIORITY']?.fieldValue || 'Priority'}</Text>
                            <DropDownPicker
                                open={dropdownOpen}
                                value={dropdownValue}
                                items={dropdownItems}
                                placeholder={t('select')}
                                dropDownContainerStyle={{ ...styles.dropdownContainer, zIndex: 5 }}
                                placeholderStyle={{ color: colors.lightgrey }}
                                setOpen={setDropdownOpen}

                                setValue={setDropdownValue}
                                setItems={setDropdownItems}
                                style={styles.dropdown}
                            />
                        </View>
                        <View>
                            <Text style={styles.label}>{fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipment Address'}</Text>
                            <DropDownPicker
                                open={shipmentDropOpen}
                                value={activeShipAddress}
                                items={arrShipAddress}
                                placeholder={t('select')}
                                placeholderStyle={{ color: colors.lightgrey }}
                                dropDownContainerStyle={{ ...styles.dropdownContainer }}
                                setOpen={setShipmentDropOpen}
                                setValue={setActiveShipAddress}
                                setItems={setArrShipAddress}
                                style={[styles.dropdown, (!activeShipAddress && formValidityChk) && { borderColor: 'red' }]}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <View style={{ flex: 1, }}>
                            <Text style={styles.label}>{fields?.['CUSTOMER_PO']?.fieldValue || 'Customer PO'}</Text>
                            <TextInput
                                style={styles.input}
                                maxLength={50}
                                placeholderTextColor={colors.lightgrey}
                                placeholder="" />
                        </View>
                        {/* Checkbox */}
                        <View style={styles.checkboxContainer}>
                            <CheckBox value={isChecked} onValueChange={setIsChecked} />
                            <Text style={styles.checkboxLabel}>{fields?.['GET_IT_TOGETHER']?.fieldValue || 'Get It Together'}</Text>
                        </View>
                    </View>
                    {/* Text Field */}
                    <Text style={styles.label}>{fields?.['NOTES']?.fieldValue || 'Notes'}</Text>
                    <TextInput
                        style={styles.input}
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                        maxLength={500}
                        placeholderTextColor={colors.lightgrey}
                        placeholder={fields?.['NOTES']?.fieldValue || 'Notes'} />

                    {/* <DatePicker
                            modal
                            open={open}
                            date={date}
                            onConfirm={(date) => {
                                setOpen(false);
                                setDate(date);
                            }}
                            onCancel={() => {
                                setOpen(false);
                            }}
                            title="Select Date"  // Custom title
                            textColor="green"    // Active date text color
                            fadeToColor="white"  // Picker background color
                            titleStyle={{ color: 'blue' }} // Header title color
                            confirmText="Confirm" // Custom confirm button text
                            cancelText="Cancel"   // Custom cancel button text
                        /> */}

                    {/* <DateTimePickerModal
                            isVisible={open}
                            mode="date"
                            onConfirm={() => setOpen(false)}
                            onCancel={() => setOpen(false)}
                            headerTextIOS="Pick a Date"   // Customize the iOS header text
                            textColor="blue"              // Active date color for iOS
                            customHeaderIOS={() => <Text style={{ color: 'red' }}>Select Date</Text>} // Custom header (iOS)
                        /> */}

                </View>}
                {/* </Animated.View> */}
            </View >
            {(status != 'SUBMITTED' && status != 'CANCEL' && status != 'APPROVED') && <View style={styles.container}>
                <ItemFilter
                    buttonTitle={{ nestedScrollCheck: true }}
                    getId={onClickedId}
                    fields={fields}
                />
            </View>}
            {(status == 'SUBMITTED' || status == 'CANCEL' || status == 'APPROVED') && <ScrollView style={{ backgroundColor: colors.primary, borderRadius: 5, flex: 1 }}>
                <CustomFlaglist listData={allCartData} getId={getClickedId}
                    buttonTitle={{
                        show: true,
                        nestedScrollCheck: false,
                    }} />
                <View style={{ gap: 7, marginBottom: 30, marginHorizontal: 25, justifyContent: 'center' }}>
                    {/* <Button style={styles.btn} mode="contained" textColor={colors.secondary} >
                            {fields?.['APPLY_LOYALTY']?.fieldValue || 'Apply Loyality'}
                        </Button>
                        <Button style={styles.btn} mode="contained" textColor={colors.secondary} >
                            {fields?.['COUPON']?.fieldValue || 'Coupon'}
                        </Button> */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['SUB_TOTAL']?.fieldValue || 'Sub Total'}</Text>
                        <Text style={styles.paymentShortText}>{totalResponse?.dtoSalesTransactionEntry?.subTotal ? Number(totalResponse?.dtoSalesTransactionEntry?.subTotal).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['ITEM_DISCOUNT']?.fieldValue || 'Item Discount'}</Text>
                        <Text style={styles.paymentShortText}>{totalResponse?.dtoSalesTransactionEntry?.itemLevelTD ? Number(totalResponse?.dtoSalesTransactionEntry?.itemLevelTD).toFixed(2) : '0.00'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['TRADE_DISCOUNT']?.fieldValue || 'Trade Discount'}</Text>
                        <Text style={styles.paymentShortText}>{totalResponse?.dtoSalesTransactionEntry?.tradeDiscount ? Number(totalResponse?.dtoSalesTransactionEntry?.tradeDiscount).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['OTHER_EXPENSES']?.fieldValue || 'Other Expense'}</Text>
                        <Text style={styles.paymentShortText}>{totalResponse?.dtoSalesTransactionEntry?.otherExpenses ? Number(totalResponse?.dtoSalesTransactionEntry?.otherExpenses).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['OTHER_EXPENSES_VAT']?.fieldValue || 'Other Expense Vat'}</Text>
                        <Text style={styles.paymentShortText}>{totalResponse?.dtoSalesTransactionEntry?.otherExpensesVat ? Number(totalResponse?.dtoSalesTransactionEntry?.otherExpensesVat).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.paymentShortText}>{fields?.['VAT']?.fieldValue || 'Vat'}</Text>
                        <Text style={styles.paymentShortText}>{totalResponse?.dtoSalesTransactionEntry?.vatSar ? Number(totalResponse?.dtoSalesTransactionEntry?.vatSar).toFixed(2) : '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopColor: colors.grey, borderTopWidth: .5, padding: 7 }}>
                        <Text style={{ ...styles.paymentShortText, fontWeight: 'bold' }}>{fields?.['TOTAL']?.fieldValue || 'Total'}</Text>
                        <Text style={{ ...styles.paymentShortText, fontWeight: 'bold' }}>{totalResponse?.dtoSalesTransactionEntry?.total ? Number(totalResponse?.dtoSalesTransactionEntry?.total).toFixed(2) : '-'}</Text>
                    </View>
                    <Button onPress={() => downloadRecord(totalResponse?.dtoSalesTransactionEntry?.id)}
                        style={[styles.btn, { backgroundColor: colors.black }]} mode="contained" textColor={colors.white} >
                        {t('print')}
                    </Button>
                    <Button onPress={() => navigation.navigate('AllQuotationScreen')}
                        style={[styles.btn, { backgroundColor: colors.danger }]} mode="contained" textColor={colors.white} >
                        {t('CANCEL')}
                    </Button>
                    <Button onPress={() => status != 'CANCEL' && showPopup()}
                        style={[styles.btn, { backgroundColor: colors.danger }, status == 'CANCEL' && { opacity: .7 }]} mode="contained" textColor={colors.white} >
                        {t('cancel_transaction')}
                    </Button>
                </View>
            </ScrollView>}
            <StructureModal
                visibilityCheck={isVisible}
                onClose={onCloseCart}
                modalTitle={fields?.['CART']?.fieldValue || 'Cart'}
                RenderContent={() => <CartScreen fields={fields} getTotalData={totalResponse} getSaveQuotation={createQuotation} />}
            />
            <CustomPopup
                visible={isPopupVisible}
                onClose={hidePopup}
                onConfirm={() => handleConfirm('cancel')}
                // title={t('')}
                confirmText={t('Yes')}
                cancelText={t('No')}
            />
            <Modal
                transparent={true}
                animationType="slide"
                visible={showReason}
                onRequestClose={() => setShowReason(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.popup}>
                        <Text style={styles.title}>{t('Reason')}</Text>
                        <TextInput
                            style={[styles.input]}
                            // placeholder={t('Reason')}
                            value={reason}
                            maxLength={500}
                            onChangeText={setReason}
                            multiline
                        />
                        {!reason && <Text style={{ color: colors.danger, fontSize: 10, }}>{t('requiredValid')}</Text>}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => setShowReason(false)}
                                style={styles.cancelButton}>
                                <Text style={styles.btnText}>{t('CANCEL')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => getReason()}
                                style={{ ...styles.cancelButton, backgroundColor: colors.secondary }}>
                                <Text style={styles.btnText}>{t('Confirm')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        flex: 1,
        backgroundColor: colors.primary,
        // paddingHorizontal: 5
        // justifyContent: 'center',
    },
    accordionHeader: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        padding: 7,
        marginVertical: 5,
        justifyContent: 'space-between',
    },
    accordionTitle: {
        color: colors.black,
    },
    accordianContainer: {
        backgroundColor: colors.primary,
        zIndex: 5,
    },
    accordionContent: {
        backgroundColor: colors.white,
        padding: 8,
        zIndex: 2,
    },
    label: {
        marginBottom: 5,
        color: colors.black,
    },
    input: {
        padding: 7,
        borderWidth: 1,
        color: colors.black,
        borderColor: colors.grey,
        borderRadius: 5,
        marginBottom: 1,
    },
    dropdown: {
        // marginBottom: 15
        zIndex: 0,
    },
    dropdownContainer: {
        zIndex: 3,
        paddingHorizontal: 10,
    },
    checkboxContainer: {
        flex: 1,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        marginLeft: 8
    },
    pickerContainer: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
    },
    btn: {
        borderRadius: 5,
    },
    paymentShortText: {
        color: colors.black,
        fontWeight: '500',
        padding: 5,
        paddingHorizontal: 20,
        fontSize: 13
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
        color: colors.black,
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
    btnText: {
        fontSize: 16,
        color: colors.white,

    },

});

export default QuotationFormScreen;
