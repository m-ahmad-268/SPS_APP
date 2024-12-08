// /screens/SettingsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { resetLoading, resetUserData, setLoading } from '../../redux/slices/authSlice';
import { Button } from 'react-native-paper';
import ArrowUp from '../../assets/icons/arrowUp.svg';
import colors from '../../Utils/colors';
import { DataTable } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { IconButton } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import CustomPagination from '../../Shared/CustomPagination';
import { getGraphData, searchAllInvoicesAndReturn, searchInDeliverySaleOrderByCustomer, searchInReturnSaleOrderByCustomer, searchInvoiceAndRetrunCount } from '../../services/drawerService';
import CustomFlaglist from '../../Shared/CustomFlaglist';
import { setScreenFieldsData } from '../../services/auth';
import { LineChart, Grid } from 'react-native-svg-charts';
import { Circle, G, Text as SVGText } from 'react-native-svg';
import SimpleLineChartComponent from '../../Shared/SimpleLineChartComponent';
import header from '../../Shared/header';
import GraphTile from '../../Shared/GraphTile';

const AllInvoicesScreen = ({ navigation, route }) => {
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
    const [searchKeyword, setSearchKeyword] = useState('');
    const [allData, setAllDate] = useState([]);
    const [graphData, setGraphData] = useState({});
    const [graphReturnData, setGraphReturnData] = useState({});
    const [totalCount, setTotalCount] = useState(null);
    const currentRouteName = route.name;
    // const [items] = useState([
    //     {
    //         key: 1,
    //         name: 'Cupcake',
    //         calories: 356,
    //         fat: 16,
    //     },
    //     {
    //         key: 2,
    //         name: 'Eclair',
    //         calories: 262,
    //         fat: 16,
    //     },
    //     {
    //         key: 3,
    //         name: 'Frozen yogurt',
    //         calories: 159,
    //         fat: 6,
    //     },
    //     {
    //         key: 4,
    //         name: 'Gingerbreadas',
    //         calories: 305,
    //         fat: 3.7,
    //     },

    // ]);
    // const from = page * itemsPerPage;
    // const to = Math.min((page + 1) * itemsPerPage, items.length);

    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    };

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-INVOICES-RETURN", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);

        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    };

    // useEffect(() => {
    //     setPage(0);
    // }, [itemsPerPage]);

    useEffect(() => {
        setScreenFieldsDataApi();
        fetchData(1);
        getInvoiceAndRetrunCount();
        GraphData();
        GraphReturnData();
    }, []);

    const GraphReturnData = async () => {
        try {
            const header = await getHeader();
            const reqBody = {
                "customerId": userProfile?.customerNo,
                "orderType": 4
            }
            const response = await getGraphData(reqBody, header);
            if (response && response?.code == 200 && response?.result) {
                setGraphReturnData(response.result);
            }



        } catch (error) {
            console.log('', error,);
            dispatch(resetLoading());
        }
    };

    const GraphData = async () => {
        try {
            const header = await getHeader();
            const reqBody = {
                "customerId": userProfile?.customerNo,
                "orderType": 2
            }
            const response = await getGraphData(reqBody, header);
            if (response && response?.code == 200 && response?.result) {
                setGraphData(response.result);
            }



        } catch (error) {
            console.log('', error,);
            dispatch(resetLoading());
        }
    };
    const getInvoiceAndRetrunCount = async () => {
        try {
            const header = await getHeader();
            const reqBody = {
                customer: {
                    custnumber: userProfile?.customerNo,
                },
                'searchKeyword': '',
                "pageNumber": 0,
                "pageSize": 5,
                "sortBy": "DESC",
                "sortOn": "id"
            }
            const response = await searchInvoiceAndRetrunCount(reqBody, header);
            if (response && response?.code == 201 && response?.result) {
                setTotalCount(response.result);
            }



        } catch (error) {
            console.log('', error,);
            dispatch(resetLoading());
        }
    };


    const fetchData = async (event) => {
        try {
            await setAllDate([]);
            dispatch(setLoading());
            const date = null;
            const headers = await getHeader();
            const body = {
                customer: {
                    custnumber: userProfile.customerNo
                },
                "statusType": 'DRAFT',
                'searchKeyword': searchKeyword,
                'pageNumber': page,
                'pageSize': 1000,
                'sortOn': 'DESC',
                'sortBy': 'id',
                'priorityId': null,
                'transactionDate': date,
                'orderRefId': null,
            }
            let response;
            if (event == 2) {
                response = await searchInDeliverySaleOrderByCustomer(body, headers);
            } else if (event == 3) {
                response = await searchInReturnSaleOrderByCustomer(body, headers);
            } else {
                response = await searchAllInvoicesAndReturn(body, headers);
            }

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
                                rowTitle: fields?.['TYPE']?.fieldValue || 'Type',
                                rowValue: x?.orderTypeValue,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['TRANSACTION_NUMBER']?.fieldValue || 'Transaction Number',
                                rowValue: x?.itemName,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['SALES_MAN']?.fieldValue || 'Sales Man',
                                rowValue: x?.saleman?.salesmanId,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['BILLING_ADDRESS']?.fieldValue || 'Billing Address',
                                rowValue: x?.billingAddress,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address',
                                rowValue: x?.shippingAddress,
                            },
                        ],
                        btnArray: [
                            {
                                title: x?.status || x?.returnStatus,
                                type: x?.status || x?.returnStatus,
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
            console.log('Error in FetchAllDataInvoice', error);
            dispatch(resetLoading());
            Toast.show({
                type: 'error', // 'error', 'info' can also be used
                text1: t('serverErrorText'),
                text2: t('error'),
            });

        }
    };

    // useEffect(() => {

    // }, [page]);

    // const loadMore = () => {
    //     if (!isLoading && hasMore) {
    //         setPage((prevPage) => prevPage + 1);
    //     }
    // };

    const getClickedId = (event) => {
        if (event?.grid?.orderType == 4) {
            const obj = {
                "status": event?.grid?.returnStatus || null,
                "id": event?.grid.id
            }
            navigation.navigate('CreateReturnScreen', { id: obj })
        }
        else if (event?.grid) {
            const obj = {
                "parentInvoiceId": event.grid?.parentInvoiceId,
                "id": event.grid?.id
            }
            navigation.navigate('EditInvoiceScreen', obj);

        }

    }

    return (
        <View style={styles.container}>
            <View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        minHeight: 250 // Add padding if needed
                    }}
                >
                    <SimpleLineChartComponent
                        title={fields?.['INVOICES']?.fieldValue || 'Invoices'}
                        dataCount={totalCount?.totalInvoiceCount}
                        comparedValue={graphData?.rejectedData?.percentage}
                        data={{
                            dataset: graphData?.deliveredData?.data,
                            label: graphData?.deliveredData?.categories
                        }}
                        onClick={() => fetchData(2)}
                    />
                    <SimpleLineChartComponent
                        title={fields?.['ALL_RETURNS']?.fieldValue || 'Returns'}
                        dataCount={totalCount?.totalReturnCount}
                        comparedValue={graphReturnData?.allData?.percentage}
                        onClick={() => fetchData(3)}
                        data={{
                            dataset: graphReturnData?.allData?.data,
                            label: graphReturnData?.allData?.categories
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => fetchData(1)}
                        style={{ marginRight: 10 }}>
                        <GraphTile
                            tileStyle={{ width: (Dimensions.get("window").width - 50) }}
                            title={fields?.['ALL_INVOICES']?.fieldValue || 'All Invoices'}
                            dataCount={totalCount?.totalCountAll}
                        />
                    </TouchableOpacity>
                </ScrollView>
            </View>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around', margin: 10 }}>
                <IconButton icon={() => <MaterialIcons name="image" size={120} color={colors.secondary} />} color="red" size={150}
                    style={{ backgroundColor: colors.white, marginHorizontal: 0, borderRadius: 10 }} onPress={() => console.log('Pressed')} />
                <IconButton icon={() => <MaterialIcons name="image" size={120} color={colors.secondary} />} color="red" size={150}
                    style={{ backgroundColor: colors.white, borderRadius: 10 }} onPress={() => console.log('Pressed')} />
            </View> */}

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


            {fields && <CustomFlaglist listData={allData} getId={getClickedId}
                buttonTitle={{
                    show: true,
                    nestedScrollCheck: true,
                }} />}

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
});

export default AllInvoicesScreen;
