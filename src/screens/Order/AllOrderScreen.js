// /screens/SettingsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { resetLoading, setLoading, setToken } from '../../redux/slices/authSlice';
import { ActivityIndicator, Button } from 'react-native-paper';
import ArrowUp from '../../assets/icons/arrowUp.svg';
import colors from '../../Utils/colors';
import { DataTable } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { IconButton } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import CustomPagination from '../../Shared/CustomPagination';
import { deleteCustomerOrder, getGraphData, searchCustomerOrderCount, searchOrderByCustomer } from '../../services/drawerService';
import CustomFlaglist from '../../Shared/CustomFlaglist';
import { setScreenFieldsData } from '../../services/auth';
import LineChartComponent from '../../Shared/LineChartComponent';
import ItemLoader from '../../Shared/ItemLoader';
import SimpleLineChartComponent from '../../Shared/SimpleLineChartComponent';
import CustomPopup from '../../Shared/CustomPopup';
import StructureModal from '../../Shared/structureModal';

const AllOrderScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([2, 3, 4]);
    const [fields, setFields] = useState(null);
    const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);
    const [hasMore, setHasMore] = useState(true);
    const [quotationCounts, setQuotationCounts] = useState(null);
    const [quotationGraph, setQuotationGraph] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [allData, setAllDate] = useState([]);
    const [recordIds, setRecordIds] = useState([]);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const currentRouteName = route.name;
    const [items] = useState([
        {
            key: 1,
            name: 'Cupcake',
            calories: 356,
            fat: 16,
        },
        {
            key: 2,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 3,
            name: 'Frozen yogurt',
            calories: 159,
            fat: 6,
        },
        {
            key: 4,
            name: 'Gingerbreadas',
            calories: 305,
            fat: 3.7,
        },

    ]);
    const [messageArray, setMessageArray] = useState([]);
    const [popupMessage, setPopupMessage] = useState(false);
    const showPopup = () => setPopupVisible(true);
    const hidePopup = () => setPopupVisible(false);
    const handleConfirm = () => {
        hidePopup();
        deleteQuotation();
    };
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);

    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-PENDING-QUOTATION", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);
            dispatch(resetLoading());
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    };

    const GraphData = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const body = {
                customerId: String(userProfile.customerNo),
                'orderType': 2,
            }
            const res = await getGraphData(body, headers);
            if (res && res.code == 200 && res?.result) {
                const responseData = res.result;
                setQuotationGraph({ ...responseData });

                const tempObj = {
                    ...responseData,
                    labels: responseData?.allData?.categories?.length ? responseData?.allData?.categories : [],
                    datasets: [
                        {
                            data: responseData?.allData?.data?.length ? responseData?.allData?.data : [],
                        }

                    ]

                };

            }
            dispatch(resetLoading());


        } catch (error) {
            console.log('GraphData----------------', error);
            dispatch(resetLoading());

        }
    };

    useEffect(() => {
        console.log('TOKN-------------------', token);

        if (!fields)
            setScreenFieldsDataApi();
        fetchData();
        CustomerOrderCount();
        GraphData();
    }, [token]);

    const fetchData = async (type) => {
        try {
            setAllDate([]);
            dispatch(setLoading());
            const date = null;
            const headers = await getHeader();
            const body = {
                customer: {
                    custnumber: userProfile.customerNo
                },
                "statusTypeOrder": type || 'DRAFT',
                'searchKeyword': searchKeyword,
                'pageNumber': page,
                'pageSize': 1000,
                'sortOn': 'DESC',
                'sortBy': 'id',
                'priorityId': null,
                'transactionDate': date,
                'orderRefId': null,
            }
            const response = await searchOrderByCustomer(body, headers);
            console.log(response.code);
            if (response && (response.code == 200 || response.code == 201) && response?.result?.records && response.result.records?.length) {
                const arr = response.result.records.map((x, index) => {
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
                                rowTitle: fields?.['ORDER_REF']?.fieldValue || 'Order Refrence',
                                rowValue: x?.referenceNo,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['SALES_MAN']?.fieldValue || 'Sales Man',
                                rowValue: currentLanguage == 'en' ? x?.saleman?.salesmanId : x?.saleman?.salesmanLastNameArabic,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['PRIORITY']?.fieldValue || 'Priority',
                                rowValue: x?.dtoRequestPriority?.description,
                            },
                            // {
                            //     show: x?.startTime ? true : false,
                            //     rowTitle: 'Reservation Time',
                            //     rowValue: x?.startTime ? convertTo12HourFormat(x?.startTime) : null,
                            // },
                            {
                                show: true,
                                rowTitle: fields?.['BILLING_ADDRESS']?.fieldValue || 'Billing Address',
                                rowValue: x?.billingAddress,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['TRANSACTION_DATE']?.fieldValue || 'Transaction Date',
                                rowValue: x?.transactionDate,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address',
                                rowValue: x?.shippingAddress,
                            },
                        ],
                        btnArray: [
                            {
                                title: x?.status,
                                type: x?.status,
                            },
                            {
                                title: t('delete'),
                                type: 'delete',
                            },
                        ]
                    }
                })
                setAllDate([...arr]);
                dispatch(resetLoading());
            } else {
                dispatch(resetLoading());
            }


            // const newData = await response.json();

            // if (newData.length === 0) {
            //     setHasMore(false);
            // } else {
            //     setData((prevData) => [...prevData, ...newData]);
            // }



        } catch (error) {
            console.log('Error in FetchAllData', error);
            dispatch(resetLoading());
            Toast.show({
                type: 'error', // 'error', 'info' can also be used
                text1: t('serverErrorText'),
                text2: t('error'),
            });

        }
    };
    const CustomerOrderCount = async () => {
        try {
            const headers = await getHeader();
            const body = {
                customer: {
                    custnumber: userProfile.customerNo,
                },
                'searchKeyword': '',
            }
            const res = await searchCustomerOrderCount(body, headers);
            if (res && res?.result) {
                const responseData = res.result;
                setQuotationCounts({ ...responseData });
                // const tempData = {
                //     ...responseData,
                //     labels: [fields?.['PENDaING']?.fieldValue || 'Pending', fields?.['APPROVED'].fieldValue || 'Approved', fields?.['REJECTED']?.fieldValue || 'Rejected', fields?.['DELIVERED']?.fieldValue || 'Delivered'],
                //     datasets: [
                //         {
                //             data: [
                //                 responseData?.totalCountPending || 0,
                //                 responseData?.totalCountApproved || 0,
                //                 responseData?.totalCountRejected || 0,
                //                 responseData?.totalCountDelivered || 0,
                //             ]
                //         }
                //     ]
                // };


            }


        } catch (error) {
            console.log('searchCustomerQutationCount----------------', error);
            dispatch(resetLoading());

        }
    };

    useEffect(() => {
        // fetchData(page);
    }, [page]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const getClickedId = (item) => {
        if (item?.data) {
            if (item.action == 'delete' && item.data?.id) {
                console.log('BtnClick', item.action, item.data?.id);
                showPopup();
                setRecordIds([item.data?.id])
            }

        } else if (item?.grid) {
            const activeItem = item.grid;
            console.log('After clicking on Grid-----', activeItem.id, activeItem?.status);
            navigation.navigate('OrderFormScreen', { id: activeItem.id, status: activeItem?.status })

        }

    };

    const deleteQuotation = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const req = {
                ids: [...recordIds],
            }
            const response = await deleteCustomerOrder(req, headers);
            if (response && response.code == 200) {
                const msgs = response?.result?.mapMessages;
                dispatch(setToken());
                if (msgs && msgs.length) {
                    setMessageArray([...msgs]);
                    setPopupMessage(true);
                }
            }
        } catch (error) {
            console.log('deleteQuotation-----------', error);
            dispatch(resetLoading());

        }
    };

    // const getClickedId = (item) => {

    //     console.log('HeloooooooooooBTNPressooooooo',);
    //     return
    //     if (item?.btn) {
    //     } else if (item?.grid) {
    //         const activeItem = item.grid;
    //         console.log('yooo', activeItem.id);
    //         navigation.navigate('OrderFormScreen', { id: activeItem.id })

    //     }

    // }

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
        <View style={styles.container}>
            {/* <Text style={styles.title} >{currentRouteName}</Text> */}
            <View>
                <ScrollView horizontal={true} style={{ minHeight: 250, }}>
                    {/* {!!quotationGraph && <LineChartComponent
                        data={{
                            labels: quotationGraph?.draftData?.categories?.length ? quotationGraph?.draftData?.categories : [],
                            datasets: [
                                {
                                    data: quotationGraph?.draftData?.data?.length ? quotationGraph?.draftData?.data : [],
                                }

                            ]
                        }}
                        disableClick={false}
                        onClick={() => fetchData('DRAFT')}
                        comparedValue={quotationGraph?.draftData?.percentage}
                        title={fields?.['DRAFT_QUOTATION']?.fieldValue || 'Waiting For Submission'}
                        dataCount={quotationCounts?.totalCountDraft}
                    />} */}
                    {/* {!!quotationGraph && <LineChartComponent
                        data={{
                            labels: quotationGraph?.submittedData?.categories?.length ? quotationGraph?.submittedData?.categories : [],
                            datasets: [
                                {
                                    data: quotationGraph?.submittedData?.data?.length ? quotationGraph?.submittedData?.data : [],
                                }

                            ]
                        }}
                        disableClick={false}
                        onClick={() => fetchData('SUBMITTED')}
                        comparedValue={quotationGraph?.submittedData?.percentage}
                        title={fields?.['SUBMITTED_QUOTATION']?.fieldValue || 'Submitted'}
                        dataCount={quotationCounts?.totalCountSubmitted}
                    />} */}

                    {/* {!!quotationGraph && <LineChartComponent
                        data={{
                            labels: quotationGraph?.pendingData?.categories?.length ? quotationGraph?.pendingData?.categories : [],
                            datasets: [
                                {
                                    data: quotationGraph?.pendingData?.data?.length ? quotationGraph?.pendingData?.data : [],
                                }

                            ]
                        }}
                        disableClick={false}
                        onClick={() => fetchData('PENDING')}
                        comparedValue={quotationGraph?.pendingData?.percentage}
                        title={fields?.['PENDING_ORDERS']?.fieldValue || 'Waiting For Approval'}
                        dataCount={quotationCounts?.totalCountPending}
                    />} */}

                    {/* {!!quotationGraph && <LineChartComponent
                        data={{
                            labels: quotationGraph?.approvedData?.categories?.length ? quotationGraph?.approvedData?.categories : [],
                            datasets: [
                                {
                                    data: quotationGraph?.approvedData?.data?.length ? quotationGraph?.approvedData?.data : [],
                                }

                            ]
                        }}
                        disableClick={false}
                        onClick={() => fetchData('APPROVED')}
                        comparedValue={quotationGraph?.approvedData?.percentage}
                        title={fields?.['APPROVED_ORDERS']?.fieldValue || 'Approved'}
                        dataCount={quotationCounts?.totalCountApproved}
                    />} */}
                    {/* {!!quotationGraph && <LineChartComponent
                        data={{
                            labels: quotationGraph?.deliveredData?.categories?.length ? quotationGraph?.deliveredData?.categories : [],
                            datasets: [
                                {
                                    data: quotationGraph?.deliveredData?.data?.length ? quotationGraph?.deliveredData?.data : [],
                                }

                            ]
                        }}
                        disableClick={false}
                        onClick={() => fetchData('DELIVERED')}
                        comparedValue={quotationGraph?.deliveredData?.percentage}
                        title={fields?.['DELIVERING_ORDERS']?.fieldValue || 'Delivering'}
                        dataCount={quotationCounts?.totalCountDelivered}
                    />} */}

                    {/* {!!quotationGraph && <LineChartComponent
                        data={{
                            labels: quotationGraph?.allData?.categories?.length ? quotationGraph?.allData?.categories : [],
                            datasets: [
                                {
                                    data: quotationGraph?.allData?.data?.length ? quotationGraph?.allData?.data : [],
                                }

                            ]
                        }}
                        disableClick={false}
                        onClick={() => fetchData('ALL')}
                        comparedValue={quotationGraph?.allData?.percentage}
                        title={fields?.['ALL_QUOTATION']?.fieldValue || 'All'}
                        dataCount={quotationCounts?.totalCountAll}
                    />} */}

                    {!!quotationGraph && <SimpleLineChartComponent
                        title={fields?.['DRAFT_QUOTATION']?.fieldValue || 'Waiting For Submission'}
                        dataCount={quotationCounts?.totalCountDraft}
                        comparedValue={quotationGraph?.draftData?.percentage}
                        disableClick={false}
                        data={{
                            dataset: quotationGraph?.draftData?.data,
                            label: quotationGraph?.draftData?.categories,
                        }}
                        onClick={() => fetchData('DRAFT')}
                    />}
                    {!!quotationGraph && <SimpleLineChartComponent
                        title={fields?.['SUBMITTED_QUOTATION']?.fieldValue || 'Submitted'}
                        dataCount={quotationCounts?.totalCountSubmitted}
                        comparedValue={quotationGraph?.submittedData?.percentage}
                        disableClick={false}
                        data={{
                            dataset: quotationGraph?.submittedData?.data,
                            label: quotationGraph?.submittedData?.categories,
                        }}
                        onClick={() => fetchData('SUBMITTED')}
                    />}
                    {!!quotationGraph && <SimpleLineChartComponent
                        title={fields?.['PENDING_ORDERS']?.fieldValue || 'Waiting For Approval'}
                        dataCount={quotationCounts?.totalCountPending}
                        comparedValue={quotationGraph?.pendingData?.percentage}
                        disableClick={false}
                        data={{
                            dataset: quotationGraph?.pendingData?.data,
                            label: quotationGraph?.pendingData?.categories,
                        }}
                        onClick={() => fetchData('PENDING')}
                    />}

                    {!!quotationGraph && <SimpleLineChartComponent
                        title={fields?.['Approved']?.fieldValue || 'Approved'}
                        dataCount={quotationCounts?.totalCountApproved}
                        comparedValue={quotationGraph?.approvedData?.percentage}
                        disableClick={false}
                        data={{
                            dataset: quotationGraph?.approvedData?.data,
                            label: quotationGraph?.approvedData?.categories,
                        }}
                        onClick={() => fetchData('APPROVED')}
                    />}
                    {!!quotationGraph && <SimpleLineChartComponent
                        title={fields?.['DELIVERING_ORDERS']?.fieldValue || 'Delivering'}
                        dataCount={quotationCounts?.totalCountDelivered}
                        comparedValue={quotationGraph?.deliveredData?.percentage}
                        disableClick={false}
                        data={{
                            dataset: quotationGraph?.deliveredData?.data,
                            label: quotationGraph?.deliveredData?.categories,
                        }}
                        onClick={() => fetchData('DELIVERED')}
                    />}
                    {!!quotationGraph && <SimpleLineChartComponent
                        title={fields?.['ALL_QUOTATION']?.fieldValue || 'All'}
                        dataCount={quotationCounts?.totalCountAll}
                        comparedValue={quotationGraph?.allData?.percentage}
                        disableClick={false}
                        data={{
                            dataset: quotationGraph?.allData?.data,
                            label: quotationGraph?.allData?.categories,
                        }}
                        onClick={() => fetchData('ALL')}
                    />}
                    {!quotationGraph && <ItemLoader customStyle={{ width: Dimensions.get("window").width }} />}
                </ScrollView>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', right: 0 }}>
                {/* <IconButton icon={() => <MaterialIcons name="filter-alt" size={20} color={colors.white} />} color="red" size={20}
                    style={{ backgroundColor: colors.black, marginHorizontal: 0 }} onPress={() => console.log('Pressed')} />
                <IconButton icon={() => <MaterialIcons name="add" size={20} color={colors.white} />} color="red" size={20}
                    style={{ backgroundColor: colors.secondary, }} onPress={() => navigation.navigate('OrderFormScreen')} /> */}
                <Button
                    onPress={() => navigation.navigate('OrderFormScreen')}
                    icon={() => <MaterialIcons name="add" size={20} color={colors.white} />}
                    style={styles.button} mode="contained" textColor={colors.white} >
                    {t('Create')}
                </Button>
            </View>

            {/* <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Dessert</DataTable.Title>
                    <DataTable.Title>Dessert</DataTable.Title>
                    <DataTable.Title>Dessert</DataTable.Title>
                    <DataTable.Title>Dessert</DataTable.Title>
                    <DataTable.Title numeric>Calories</DataTable.Title>
                    <DataTable.Title numeric>Fat</DataTable.Title>
                </DataTable.Header>

                {items.slice(from, to).map((item) => (
                    <DataTable.Row key={item.key}>
                        <DataTable.Cell>{item.name}</DataTable.Cell>
                        <DataTable.Cell>{item.name}</DataTable.Cell>
                        <DataTable.Cell>{item.name}</DataTable.Cell>
                        <DataTable.Cell>{item.name}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.calories}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.fat}</DataTable.Cell>
                    </DataTable.Row>
                ))} */}

            {/* <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(items.length / itemsPerPage)}
                    onPageChange={(page) => setPage(page)}
                    label={`${from + 1}-${to} of ${items.length}`}
                    numberOfItemsPerPageList={numberOfItemsPerPageList}
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={onItemsPerPageChange}
                    showFastPaginationControls={false}
                    style={{}}
                    selectPageDropdownLabel={'Rows per page'}
                /> */}
            {/* <View style={styles.customPagination}>
                    <TouchableOpacity
                        onPress={() => setPage(Math.max(page - 1, 0))}
                        disabled={page === 0}
                        style={styles.button}
                    >
                        <MaterialIcons name="chevron-left" size={24} color={page === 0 ? "#ccc" : "#000"} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>{page + 1} of {to}</Text>
                    <TouchableOpacity
                        onPress={() => setPage(Math.min(page + 1, to - 1))}
                        disabled={page === to - 1}
                        style={styles.button}
                    >
                        <MaterialIcons name="chevron-right" size={24} color={page === to - 1 ? "#ccc" : "#000"} />
                    </TouchableOpacity>
                </View> */}
            {/* <CustomPagination page={page} numberOfPages={Math.ceil(items.length / itemsPerPage)} onPageChange={(page) => setPage(page)} /> */}

            {/* <CustomPagination
                    page={page}
                    numberOfPages={Math.ceil(items.length / itemsPerPage)}
                    onPageChange={(page) => setPage(page)}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={onItemsPerPageChange}
                /> */}
            {/* </DataTable> */}

            {/* {fields && <CustomFlaglist listData={allData} getId={getClickedId}
                buttonTitle={{ title: t('draft'), nestedScrollCheck: true }} />} */}

            {fields && <CustomFlaglist listData={allData} getId={getClickedId}
                buttonTitle={{
                    show: true,
                    nestedScrollCheck: true,
                }} />}
            <CustomPopup
                visible={isPopupVisible}
                onClose={hidePopup}
                onConfirm={handleConfirm}
                // title={t('')}
                confirmText={t('Yes')}
                cancelText={t('No')}
            />
            <StructureModal
                visibilityCheck={popupMessage}
                onClose={() => setPopupMessage(false)}
                modalTitle={fields?.['MESSAGES']?.fieldValue || 'Messages'}
                RenderContent={() =>
                    !!messageArray.length && messageArray.map((item, index) => (
                        <Text key={index} style={[styles.errorMessages, !item?.value && { backgroundColor: colors.danger }]}> {item?.key || ''}</Text>
                    ))
                }
            />
            {/* <FlatList
                data={allData}
                keyExtractor={(item) => String(item.id)}
                // onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => <Text>{item.referenceNo}</Text>}
            // ListFooterComponent={isLoading}
            /> */}

            {/* <Button icon="camera" style={{ backgroundColor: 'purple', color: colors.white, }} mode="contained" onPress={fetchData}>
                Press me
            </Button> */}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        backgroundColor: colors.primary,
        paddingVertical: 10,

    },
    title: {
        fontSize: 20,
        marginHorizontal: 10
        // backgroundColor: 'red',
    },
    hiddenPagination: {
        height: 0, // Hide default pagination completely
        overflow: 'hidden',
    },
    customPagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    pageText: {
        fontSize: 16,
        marginHorizontal: 10,
    },
    button: {
        backgroundColor: colors.secondary,
        borderRadius: 5,
        margin: 5,
    },
    errorMessages: {
        backgroundColor: colors.success,
        color: colors.white,
        padding: 5,
        marginTop: 5,
        marginHorizontal: 3
    },
});

export default AllOrderScreen;
