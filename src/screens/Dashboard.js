// /components/SomeComponent.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, I18nManager, Button, TouchableOpacity, Alert, TouchableWithoutFeedback, ScrollView, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { resetLoading, setLoading } from '../redux/slices/authSlice';
import colors from '../Utils/colors';
import GraphTile from '../Shared/GraphTile';
import { setScreenFieldsData } from '../services/auth';
import {
    LineChart,
    PieChart,
    BarChart,
    // ProgressChart,
    // ContributionGraph,
    // StackedBarChart
} from "react-native-chart-kit";
// import LineChartComponent from '../Shared/LineChartComponent';
import { getCustomerAccountDetailByCustomerId, getGraphData, searchCustomerOrderCount, searchCustomerQutationCount, getExpiredCustomerDocuments, getData, getExpiredInDaysCustomerDocuments } from '../services/drawerService';
import ItemLoader from '../Shared/ItemLoader';
import Toast from 'react-native-toast-message';
import SimpleLineChartComponent from '../Shared/SimpleLineChartComponent';
// import { Svg, G } from 'react-native-svg';

const Dashboard = React.memo(({ navigation, route }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const initializeData = {
        labels: ["May", "June", "july", "August",],
        datasets: [
            {
                data: [
                    0, 0, 0, 0,
                ]
            }
        ]
    };
    const currentLanguage = useSelector((state) => state.language.language);
    const { userProfile, token } = useSelector((state) => state.auth);
    const [fields, setFields] = useState(null);
    const [reloadOnce, setreloadOnce] = useState(0);
    const [customerDetail, setCustomerDetail] = useState(null);
    const [expirdeDocumentDetail, setExpirdeDocumentDetail] = useState(null);
    const [expiredDocumentsCountDetailsIn, setExpiredDocumentsCountDetailsIn] = useState(null);
    const [outstandingInvoicesCount, setOutstandingInvoicesCount] = useState(null);
    const [quotationCounts, setQuotationCounts] = useState(null);
    const [orderGraph, setOrderGraph] = useState(null);
    const [quotationGraph, setQuotationGraph] = useState(null);
    const [orderCounts, setOrderCounts] = useState(null);
    const [quotationChat, setQuotationCart] = useState(null);
    const screenWidth = Dimensions.get("window").width;
    const chartConfig = {
        backgroundGradientFrom: colors.blue,
        backgroundGradientFromOpacity: .6,
        backgroundGradientTo: colors.secondary,
        backgroundGradientToOpacity: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
    };
    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    useFocusEffect(() => {
        console.log('DashboardTriggered------------useFocusEffect------------------');

        setTimeout(() => {
            setTimeout
            setreloadOnce(token);
        }, 1000);
        return () => {
            console.log('Dashboard unfocused');
        };

    });
    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-DASHBOARD", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);
            dispatch(resetLoading());
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    }
    const openingBalance = useMemo(() => customerDetail?.openingBalance || null, [customerDetail]);

    const customerAccountDetailByCustomerId = async () => {
        try {
            // setCustomerDetail(null);
            const headers = await getHeader();
            const res = await getCustomerAccountDetailByCustomerId({ customerId: userProfile.customerNo }, headers);
            if (res && res.code == 200 && res?.result) {
                setCustomerDetail(res.result);
                console.log('customerAccountDetailByCustomerId');

            } else {
                setCustomerDetail(true);
            }


        } catch (error) {
            console.log('getCustomerAccountDetailByCustomerId----------------', error);
            dispatch(resetLoading());

        }
    };
    const ExpirdeDocumentDetail = useMemo(() => expirdeDocumentDetail?.totalCount || '0', [expirdeDocumentDetail?.totalCount]);

    const ExpiredCustomerDocuments = async () => {
        try {
            setExpirdeDocumentDetail(null);
            const headers = await getHeader();
            const res = await getExpiredCustomerDocuments({ customerId: userProfile.customerNo }, headers);
            if (res && res.code == 200 && res?.result) {
                setExpirdeDocumentDetail(res.result);
                console.log('setExpirdeDocumentDetail');

            }


        } catch (error) {
            console.log('ExpiredCustomerDocuments----------------', error);
            dispatch(resetLoading());

        }
    };
    const ExpiredDocumentsCountDetailsIn = useMemo(() => expiredDocumentsCountDetailsIn || '0', [expiredDocumentsCountDetailsIn]);

    const ExpiredInDaysCustomerDocuments = async () => {
        try {
            setExpiredDocumentsCountDetailsIn(null);
            const headers = await getHeader();
            const data = await getExpiredInDaysCustomerDocuments({ customerId: userProfile.customerNo }, headers);
            if (data.code == 200) {
                if (data.result?.records?.length) {
                    const count = data.result.records[1]?.value?.totalCount || 0;
                    setExpiredDocumentsCountDetailsIn(count);
                    console.log('setExpiredDocumentsCountDetailsIn');

                }

            }


        } catch (error) {
            console.log('ExpiredInDaysCustomerDocuments----------------', error);
            dispatch(resetLoading());

        }
    };
    const OutstandingInvoicesCount = useMemo(() => outstandingInvoicesCount || '0', [outstandingInvoicesCount]);

    const Data = async () => {
        try {
            const headers = await getHeader();
            const currentDate = new Date();
            const reqBody = {
                salesManIDs: null,
                customerIds: userProfile?.customerNo ? [userProfile.customerNo] : [],
                date: currentDate.toLocaleDateString(),
                landscape: true,
                location: null,
                siteIDs: userProfile.siteId ? [userProfile.siteId] : [],
                territoryIDs: null,
                projectIDs: null,
                departmentIDs: null,
                divisionIDs: null,
                country: null,
                state: null,
                city: null,
                zeroDaysExceed: true,
                showUpComingDueInvoices: true
            }
            const res = await getData(reqBody, headers);
            if (res && res.code == 200 && res?.result) {
                const count = res.result?.data?.length ? data.result.data.length : 0;
                setOutstandingInvoicesCount(count);
                console.log('setOutstandingInvoicesCount');

            }


        } catch (error) {
            console.log('Data----------------', error);
            dispatch(resetLoading());
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
                const tempData = {
                    ...responseData,
                    labels: [fields?.['PENDaING']?.fieldValue || 'Pending', fields?.['APPROVED']?.fieldValue || 'Approved', fields?.['REJECTED']?.fieldValue || 'Rejected', fields?.['DELIVERED']?.fieldValue || 'Delivered'],
                    datasets: [
                        {
                            data: [
                                responseData?.totalCountPending || 0,
                                responseData?.totalCountApproved || 0,
                                responseData?.totalCountRejected || 0,
                                responseData?.totalCountDelivered || 0,
                            ]
                        }
                    ]
                };
                setOrderCounts({ ...tempData });

            }


        } catch (error) {
            console.log('searchCustomerQutationCount----------------', error);
            dispatch(resetLoading());

        }
    };
    const OrderGraph = useMemo(() => orderGraph || null, [orderGraph]);

    const orderGraphData = async () => {
        try {
            const headers = await getHeader();
            const body = {
                customerId: String(userProfile.customerNo),
                'orderType': 2,
            }
            const res = await getGraphData(body, headers);
            if (res && res.code == 200 && res?.result) {
                const responseData = res.result;
                const tempObj = {
                    ...responseData,
                    labels: responseData?.allData?.categories?.length ? responseData?.allData?.categories : [],
                    datasets: [
                        {
                            data: responseData?.allData?.data?.length ? responseData?.allData?.data : [],
                        }

                    ]

                };
                setOrderGraph({ ...tempObj });
            } else {
                setOrderGraph(initializeData);
            }


        } catch (error) {
            console.log('GraphData----------------', error);
            dispatch(resetLoading());

        }
    };
    const QuotationGraph = useMemo(() => quotationGraph || null, [quotationGraph]);
    const GraphData = async () => {
        try {
            const headers = await getHeader();
            const body = {
                customerId: String(userProfile.customerNo),
                'orderType': 1,
            }
            const res = await getGraphData(body, headers);
            if (res && res.code == 200 && res?.result) {
                const responseData = res.result;
                const tempObj = {
                    ...responseData,
                    labels: responseData?.allData?.categories?.length ? responseData?.allData?.categories : [],
                    datasets: [
                        {
                            data: responseData?.allData?.data?.length ? responseData?.allData?.data : [],
                        }

                    ]

                };
                setQuotationGraph({ ...tempObj });

            } else {
                setQuotationGraph(initializeData);
            }


        } catch (error) {
            console.log('GraphData----------------', error);
            dispatch(resetLoading());

        }
    };
    const QuotationChat = useMemo(() => quotationChat || [], [quotationChat]);
    const CustomerQutationCount = async () => {
        try {
            const headers = await getHeader();
            const body = {
                customer: {
                    custnumber: userProfile.customerNo,
                },
                'searchKeyword': '',
            }
            const res = await searchCustomerQutationCount(body, headers);
            if (res && res?.result) {
                const responseData = res.result;
                setQuotationCounts(res.result);
                const arr = [
                    {
                        "name": fields?.['PEqNDING']?.fieldValue || 'Pending',
                        "value": responseData?.totalCountPending || 0,
                        color: "#d1462d",
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 15
                    },
                    {
                        "name": fields?.['APPROVED']?.fieldValue || 'Approved',
                        "value": responseData?.totalCountApproved || 0,
                        color: "#f26045",
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 15
                    },
                    {
                        "name": fields?.['REJECTED']?.fieldValue || 'Rejected',
                        "value": responseData?.totalCountRejected || 0,
                        color: colors.secondary,
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 15
                    },
                    {
                        "name": fields?.['DRAasFT']?.fieldValue || 'Draft',
                        "value": responseData.totalCountDraft || 0,
                        color: "#fe6d52",
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 15
                    },
                    {
                        "name": fields?.['EXPIRED']?.fieldValue || 'Expired',
                        "value": responseData?.totalCountExpired || 0,
                        color: "#faa795",
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 15
                    },
                    {
                        "name": fields?.['CANCELED']?.fieldValue || "Cancelled",
                        "value": responseData?.totalCountCanceled || 0,
                        color: "#ffb9a8",
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 15
                    },
                ];
                setQuotationCart([...arr]);

            }


        } catch (error) {
            console.log('searchCustomerQutationCount----------------', error);
            dispatch(resetLoading());

        }
    }
    useEffect(() => {
        // dispatch(setLoading());
        // console.log('DashboardTriggered------------------------------');
        // console.log("BarChart:", BarChart);
        if (!fields)
            setScreenFieldsDataApi();
        customerAccountDetailByCustomerId();
        CustomerQutationCount();
        CustomerOrderCount();
        GraphData();
        orderGraphData();
        Data();
        ExpiredCustomerDocuments();
        ExpiredInDaysCustomerDocuments();
        // setTimeout(() => {
        //     dispatch(resetLoading());
        // }, 5000);


    }, [reloadOnce]);

    const handleGraphClick = (value) => {
        navigation.navigate(value);

    };

    return (
        <ScrollView style={[styles.container]}>
            {/* {!!QuotationGraph ? <LineChartComponent
                data={QuotationGraph}
                onClick={() => handleGraphClick('AllQuotationScreen')}
                comparedValue={QuotationGraph?.allData?.percentage}
                dataCount={quotationCounts?.totalCountAll}
                title={fields?.['QUOTATIONS']?.fieldValue || 'Quotations'}
            /> : <ItemLoader
                customStyle={{ height: 250 }} />}

            {!!OrderGraph ? <LineChartComponent
                data={OrderGraph}
                onClick={() => handleGraphClick('AllOrderScreen')}
                comparedValue={OrderGraph?.allData?.percentage}
                title={fields?.['ORDERS']?.fieldValue || 'Orders'}
                dataCount={orderCounts?.totalCountAll}
            /> : <ItemLoader customStyle={{ height: 250 }} />} */}

            {!!QuotationGraph ? <SimpleLineChartComponent
                title={fields?.['QUOTATIONS']?.fieldValue || 'Quotations'}
                dataCount={quotationCounts?.totalCountAll}
                comparedValue={QuotationGraph?.allData?.percentage}
                data={{
                    dataset: QuotationGraph?.datasets[0].data,
                    label: QuotationGraph?.labels,
                }}
                onClick={() => handleGraphClick('AllQuotationScreen')} F
            /> : <ItemLoader
                customStyle={{ height: 250 }} />}

            {!!QuotationGraph ? <SimpleLineChartComponent
                title={fields?.['ORDERS']?.fieldValue || 'Orders'}
                dataCount={orderCounts?.totalCountAll}
                comparedValue={OrderGraph?.allData?.percentage}
                data={{
                    dataset: OrderGraph?.datasets[0].data,
                    label: OrderGraph?.labels,
                }}
                onClick={() => handleGraphClick('AllOrderScreen')}
            /> : <ItemLoader
                customStyle={{ height: 250 }} />}

            <View style={{ flexDirection: 'row', gap: 5, marginHorizontal: 10 }}>

                {!!openingBalance ? <GraphTile
                    data={[]}
                    icon={'attach-money'}
                    dataCount={openingBalance}
                    title={fields?.['CUSTOMER_BALANCE']?.fieldValue || 'Customer Balance'} /> : <ItemLoader customStyle={{ height: 50 }} />}
                {OutstandingInvoicesCount ? <GraphTile
                    data={[]}
                    icon='receipt-long'
                    dataCount={OutstandingInvoicesCount}
                    title={fields?.['OUTSTANDING_INVOICES']?.fieldValue || 'Outstanding Invoices'} /> : <ItemLoader customStyle={{}} />}
            </View>
            <View style={{ flexDirection: 'row', gap: 5, marginHorizontal: 10, marginVertical: 5 }}>
                {!!ExpirdeDocumentDetail ? <GraphTile
                    data={[]}
                    dataCount={ExpirdeDocumentDetail}
                    icon={'description'}
                    title={fields?.['EXPIRED_DOCS']?.fieldValue || 'Expired Documents'} /> : <ItemLoader customStyle={{ height: 50 }} />}
                {ExpiredDocumentsCountDetailsIn ? <GraphTile
                    data={[]}
                    icon='history'
                    dataCount={ExpiredDocumentsCountDetailsIn}
                    title={(fields?.['EXPIRING_IN']?.fieldValue || 'Expired In') + ' ' + 30 + ' / ' + 7 + ' ' + (fields?.['DAYS']?.fieldValue || 'Days')} /> : <ItemLoader customStyle={{}} />}
            </View>
            {QuotationChat ? < View style={styles.graphCardView}>
                <Text style={styles.graphHeadingText}>{fields?.['QUOTATIONS_STATUS_CHART']?.fieldValue || 'Quoatation Status Chart'}</Text>
                {(QuotationChat.length ? true : false) && <PieChart
                    data={QuotationChat}
                    width={screenWidth}
                    height={200}
                    chartConfig={chartConfig}
                    accessor={"value"}
                    backgroundColor={"transparent"}
                    paddingLeft={"0"}
                    center={[0, 0]}
                    absolute
                />}
            </View> : <ItemLoader customStyle={{ height: 200 }} />
            }
            <View style={{ ...styles.graphCardView, marginBottom: 40 }}>
                <Text style={styles.graphHeadingText}>{fields?.['ORDER_STATUS']?.fieldValue || 'Order Status'}</Text>
                {(orderCounts ? true : false) && <LineChart
                    data={orderCounts}
                    // data={{
                    //     labels: ["January", "February", "March", "May", "June", "july", "August", "September", "October", "November", "December",],
                    //     datasets: [
                    //         {
                    //             data: [
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //                 Math.random() * 100,
                    //             ]
                    //         }
                    //     ]
                    // }
                    // }
                    width={screenWidth * .90} // from react-native
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="k"
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundColor: "white",
                        backgroundGradientFrom: colors.secondary,
                        backgroundGradientTo: '#ffb9a8',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "3",
                            strokeWidth: "3",
                            stroke: colors.black
                        }
                    }}
                    bezier
                    style={{
                        alignSelf: 'center'
                        // marginVertical: 8,
                        // borderRadius: 16
                    }}
                />}
            </View>

            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 5 }}>
                <GraphTile
                    data={data.datasets}
                    title={fields?.['QUOTATIONS'].fieldValue || 'Quotations'}
                />
                <GraphTile
                    data={data.datasets}
                    title={fields?.['ORDERS'].fieldValue || 'Orders'}
                />
            </View> */}
            {/* <BarChart
                // style={{}}
                data={data}
                width={400}
                height={220}
                yAxisLabel="$"
                chartConfig={chartConfig}
                verticalLabelRotation={30}
            /> */}

            {/* <Text style={styles.text}>{t('SAR')}</Text> */}
            {/* <Text style={styles.text}>{'طشسيشسيشس'}</Text> */}
            {/* <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Svg height="100" width="100">
                    <Circle cx="50" cy="50" r="45" stroke="blue" strokeWidth="2.5" fill="green" />
                </Svg>
            </View> */}
            {/* <View style={{ padding: 20, backgroundColor: 'pink' }}>
                <VictoryPie data={data} />

            </View> */}
            {/* <Button title={'Page Refresh'} onPress={() => navigation.navigate('SettingsScreen')} /> */}
            {/* <BarChart style={{ flex: 1, backgroundColor: 'red', }} data={[{ x: "Cats", y: 35 }, { x: "Dogs", y: 40 }, { x: "Birds", y: 25 }]} svg={{ fill: 'blue' }} /> */}
            {/* <BarChart
                style={{ flex: 1, }}
                data={data}
                width={20}
                height={10}
                svg={{ fill: 'red' }}
                contentInset={{ top: 50, bottom: 50 }}
            >
                <PieChart />
            </BarChart> */}
            {/* <View style={{ padding: 10, margin: 10, height: 200, backgroundColor: colors.primary }}>
                <BarChart
                    style={{ flex: 1, }}
                    height={220}
                    data={data.datasets}
                    yAccessor={({ item }) => item.y}
                    xAccessor={({ item }) => item.x}
                    svg={{ fill: colors.secondary }}
                    showValuesOnTopOfBars={true} s
                    contentInset={{ top: 30, bottom: 30 }}
                    curve={shape.curveLinear}
                >
                    <LineChart />
                </BarChart>
            </View> */}
            {/* <ScrollView showsHorizontalScrollIndicator={true} horizontal={true} contentContainerStyle={{ gap: 20, padding: 20, }}>
                <GraphTile data={[]} title={fields?.['CUSTOMER_BALANCE'].fieldValue || 'Customer Balance'} />

                <View style={{ backgroundColor: colors.white, minWidth: 200, height: 150, }}>
                    <Text>Customer Balance</Text>
                    <View style={{ borderRadius: 10, gap: 5, alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row', }}>
                        {data.datasets.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={{ flex: 1 }}
                                onPress={() => handleBarClick(item)}
                            >
                                <View
                                    style={{
                                        // position: 'absolute',
                                        backgroundColor: colors.secondary,
                                        // left: index * 50 + 10, // Adjust left position based on index
                                        width: '100%', // Width of each bar
                                        height: (item.y), // Height of each bar based on its value
                                    }}
                                >
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView> */}

            {/* <BarChart
                style={{ flex: 1 }}
                data={data}
                svg={{ fill: 'blue' }}
                contentInset={{ top: 20, bottom: 20 }}
            >
                <Grid />
            </BarChart> */}
        </ScrollView >
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        // Other styles
    },
    graphHeadingText: {
        fontSize: 15,
        paddingBottom: 10,
        fontWeight: 'bold',
        color: colors.black,
        paddingHorizontal: 15,
        // paddingTop: 10
    },
    graphCardView: {
        paddingVertical: 10,
        backgroundColor: colors.white,
        marginHorizontal: 10,
        borderRadius: 10,
        marginBottom: 5
    }
});

export default Dashboard;
