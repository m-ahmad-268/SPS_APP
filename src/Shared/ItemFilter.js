import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Dimensions, ScrollView, Switch } from 'react-native';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import colors from '../Utils/colors';
import { useDispatch, useSelector } from 'react-redux';
import { search, getAllFilters } from '../services/drawerService';
import { resetLoading, setLoading } from '../redux/slices/authSlice';
import { ActivityIndicator, Button } from 'react-native-paper';
import { setScreenFieldsData } from '../services/auth';
import { Searchbar } from 'react-native-paper';
import { IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Drawer } from 'react-native-paper';
import CheckBox from '@react-native-community/checkbox';
import Slider from '@react-native-community/slider';
// import StructureModal from './structureModal';
// import CartScreen from '../screens/CartScreen';
import { setCartItems, setCartVisible } from '../redux/slices/customerSlice';

const ItemFilter = React.memo(({ buttonTitle, getId }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [listData, setListData] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [fields, setFields] = useState(null);
    const [pageSize, setPageSize] = useState(15);
    const [totalCount, setTotalCount] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [page, setPage] = useState(0);
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);
    const screenWidth = Dimensions.get('window').width;
    const { cartItems, isVisible } = useSelector(state => state.customer);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState(null);
    const [searchFilters, setSearchFilters] = useState({
        classIds: [],
        endPrice: 0,
    });
    const [accordianExpand, setAccordianExpand] = useState({
        class: false,
        price: false,
    });

    const spacing = 5; // The space between items
    const slideAnim = useRef(new Animated.Value(-300)).current;

    // Calculate the number of columns that can fit the screen width
    const numColumns = Math.floor(screenWidth / (200 + spacing));


    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    useEffect(() => {
        // Debouncing: wait for the user to stop typing
        const timer = setTimeout(() => {
            setDebouncedQuery(searchKeyword);
        }, 500); // Delay time in milliseconds (500ms here)

        // Cleanup the timer if user starts typing before the delay ends
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    useEffect(() => {
        console.log('=====================Item-----debousmse-------------', searchKeyword);
        dispatch(setCartVisible(false));
        setListData([]);
        setHasMore(true);
        setPage(0);
        setTotalCount(0);
        fetchData();


    }, [debouncedQuery, searchFilters]);

    useEffect(() => {

        if (!fields)
            setScreenFieldsDataApi();
        console.log('=====================Item-----fetchData-------------', page);
        getAllFilter();


    }, [page]);

    useEffect(() => {

        if (listData.length)
            dispatch(resetLoading());


    }, [listData.length]);

    const loadMore = (event) => {
        console.log('=====================Item-----loadMore-------------', hasMore);
        if (!isLoading && hasMore) {
            setPage((prevPage) => prevPage + 1);
            fetchData(page + 1);
        }
    };

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-SHARED-ITEMS-WITH_FILTERS", { 'langid': currentLanguage == 'ar' ? 2 : 1 });
            setFields(response);
            // dispatch(resetLoading());
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    }

    const fetchData = async (pageIndex) => {
        try {
            dispatch(setLoading());
            // const date = null;
            // const body = {
            //     customer: {
            //         custnumber: userProfile.customerNo
            //     },
            //     "statusType": 'DRAFT',
            //     'searchKeyword': searchKeyword,
            //     'pageNumber': page,
            //     'pageSize': 1000,
            //     'sortOn': 'DESC',
            //     'sortBy': 'id',
            //     'priorityId': null,
            //     'transactionDate': date,
            //     'orderRefId': null,
            // }
            const headers = await getHeader();
            const body = {
                id: Number(userProfile.siteId),
                custNumber: userProfile?.customerNo,
                searchKeyword: searchKeyword,
                pageSize: pageSize,
                // pageNumber: fetchMore ? this.pageNumber : 0,
                pageNumber: pageIndex || 0,
                searchCriteria: {
                    // categoryIds1: this.searchCriteria.categoryIds1.map((x: any) => x.id),
                    // categoryIds2: this.searchCriteria.categoryIds2.map((x: any) => x.id),
                    // categoryIds3: this.searchCriteria.categoryIds3.map((x: any) => x.id),
                    // categoryIds4: this.searchCriteria.categoryIds4.map((x: any) => x.id),
                    // categoryIds5: this.searchCriteria.categoryIds5.map((x: any) => x.id),
                    // categoryIds6: this.searchCriteria.categoryIds6.map((x: any) => x.id),
                    // miscIds: this.searchCriteria.miscIds.map((x: any) => x.valueId),
                    // classIds: this.searchCriteria.classIds.map((x: any) => x.id),
                    categoryIds1: [],
                    categoryIds2: [],
                    categoryIds3: [],
                    categoryIds4: [],
                    categoryIds5: [],
                    categoryIds6: [],
                    miscIds: [],
                    classIds: searchFilters.classIds,
                    priceFrom: 0,
                    priceEnd: searchFilters.endPrice,
                    fromSps: true,
                    discountForSps: true,
                    discountId: null,
                    showDiscountedItemsOnly: false,
                },
                // sortId: Number(this.selectedSortId[0].id),
                sortId: 1,
                // order: this.isOrder,
                order: false,
                // quotation: this.isQuotation,
                quotation: true,
                "optimizeSearch": true,
                setItemIds: pageIndex ? [] : []
                // setItemIds: fetchMore ? this.itemsData : []
            };


            // console.log(headers);
            // console.log(body);
            const response = await search(body, headers);


            if (response && (response.code == 200 || response.code == 201) && response?.result?.records && response.result.records?.length) {
                if (response.result.records.length < pageSize) {
                    setHasMore(false);
                }
                setTotalCount(response?.result?.totalCount || 0);
                setListData((prevData) => [...prevData, ...response.result.records]);
                //     const arr = response.result.records.map((x, index) => {
                //         const rand = Math.random() * (100 - 1 + 1) + 1;
                //         return {
                //             ...x,
                //             key: x.id + index + rand,
                //             showHeader: false,
                //             // headerTitile: 'Order Number',
                //             // headerTitleValue: x?.orderRefNo,
                //             // headerDesc: 'Transaction Date',
                //             // headerDescValue: x?.transationDate,
                //             orderRefNo: x?.orderRefNo,
                //             cardHeader: fields?.['ORDER_FROM']?.fieldValue || 'Order From',
                //             returnedQty: 0,
                //             rows: [
                //                 {
                //                     show: true,
                //                     rowTitle: fields?.['ORDER_REF']?.fieldValue || 'Order Refrence',
                //                     rowValue: x?.referenceNo,
                //                 },
                //                 {
                //                     show: true,
                //                     rowTitle: fields?.['SALES_MAN']?.fieldValue || 'Sales Man',
                //                     rowValue: currentLanguage == 'en' ? x?.saleman?.salesmanId : x?.saleman?.salesmanLastNameArabic,
                //                 },
                //                 {
                //                     show: true,
                //                     rowTitle: fields?.['PRIORITY']?.fieldValue || 'Priority',
                //                     rowValue: x?.dtoRequestPriority?.description,
                //                 },
                //                 // {
                //                 //     show: x?.startTime ? true : false,
                //                 //     rowTitle: 'Reservation Time',
                //                 //     rowValue: x?.startTime ? convertTo12HourFormat(x?.startTime) : null,
                //                 // },
                //                 {
                //                     show: true,
                //                     rowTitle: fields?.['BILLING_ADDRESS']?.fieldValue || 'Billing Address',
                //                     rowValue: x?.billingAddress,
                //                 },
                //                 {
                //                     show: true,
                //                     rowTitle: fields?.['TRANSACTION_DATE']?.fieldValue || 'Transaction Date',
                //                     rowValue: x?.transactionDate,
                //                 },
                //                 {
                //                     show: true,
                //                     rowTitle: fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address',
                //                     rowValue: x?.shippingAddress,
                //                 },
                //             ]
                //         }
                //     })
                // setAllDate(arr);
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
    const getDataQuantity = (event) => {
        console.log('event----------------------------', event);

    };

    // Animate sidebar
    const toggleSidebar = (show) => {
        setShowModal(show);
        Animated.timing(slideAnim, {
            toValue: show ? 0 : -300, // Move in or out
            duration: 300, // Animation duration
            useNativeDriver: true,
        }).start();
    };

    const getAllFilter = async () => {
        try {
            const header = await getHeader();
            const body = {
                custnumber: userProfile?.customerNo,
            };
            const response = await getAllFilters(body, header);
            console.log(response?.result?.classSetup?.length);
            if (response?.result?.classSetup && response?.result) {
                setFilters(response?.result);
                // setFilterArray([
                //     {
                //         id: 1,
                //         title: 'Categories',
                //         expanded: false,
                //         options: [
                //             { id: 'cat1', label: 'Electronics', checked: false },
                //             { id: 'cat2', label: 'Clothing', checked: false },
                //         ],
                //     },
                //     {
                //         id: 2,
                //         title: 'Brands',
                //         expanded: false,
                //         options: [
                //             { id: 'brand1', label: 'Samsung', checked: false },
                //             { id: 'brand2', label: 'Apple', checked: false },
                //         ],
                //     },
                //     {
                //         id: 3,
                //         title: 'Brands',
                //         expanded: false,
                //         options: [
                //             { id: 'brand1', label: 'Samsung', checked: false },
                //             { id: 'brand2', label: 'Apple', checked: false },
                //         ],
                //     },
                // ]);
            }



        } catch (error) {
            console.log('getAllFilters ----------------', error);
            dispatch(resetLoading());

        }
    };

    const handleDecrement = (id) => {
        const updatedListData = [...listData];

        // Increment the quantity of the found item
        updatedListData[id] = {
            ...updatedListData[id],
            quantity: (updatedListData[id].quantity || 1) - 1 // Default to 1 if undefined
        };

        // Update the state with the new list
        setListData(updatedListData);

        dispatch(setCartItems({ action: 'MODIFY_CART', value: { indexOf: updatedListData[id].itemNumber, obj: { quantity: updatedListData[id].quantity || 1 } } }));


        // if (itemQuantity > 1) {
        //     setItemQuantity((prev) => prev - 1);
        // }
    };
    const handleIncrement = (id) => {
        const updatedListData = [...listData];

        // const obj = cartItems.length ? cartItems.find(x => x.itemNumber == event.itemNumber) : null;
        // console.log(obj);
        // Increment the quantity of the found item
        updatedListData[id] = {
            ...updatedListData[id],
            quantity: (updatedListData[id].quantity || 1) + 1 // Default to 1 if undefined
        };

        dispatch(setCartItems({ action: 'MODIFY_CART', value: { indexOf: updatedListData[id].itemNumber, obj: { quantity: updatedListData[id].quantity } } }));


        // Update the state with the new list
        setListData(updatedListData);
    };

    const setSearchFiltersFunc = async (id, type) => {
        if (type == 'class') {
            const tempArr = searchFilters.classIds;
            const index = tempArr.indexOf(id);
            if (index === -1) {
                setSearchFilters(prev => (
                    {
                        ...prev,
                        classIds: [...tempArr, id],
                    }
                ))
            } else {
                tempArr.splice(index, 1);
                setSearchFilters(prev => (
                    {
                        ...prev,
                        classIds: [...tempArr],
                    }
                ))
            }
        }
        else if (type == 'price') {
            setSearchFilters(prev => (
                {
                    ...prev,
                    endPrice: id,
                }
            ))
        }

    };

    const isSelected = (id, type) => {
        if (type == 'class') {
            const isExist = searchFilters.classIds.length && searchFilters.classIds.includes(id);
            if (isExist)
                return true;
            return false;

        }

        return false;
    };


    const toggleExpand = (type) => {
        setAccordianExpand(prev => ({
            ...prev,
            [type]: !accordianExpand[type],
        }))

        // setFilterArray((prevFilters) =>
        //     prevFilters.map((filter) =>
        //         filter.id === id ? { ...filter, expanded: !filter.expanded } : filter
        //     )
        // );
    };

    const applyFilter = () => {
        // setFilterArray((prevFilters) =>
        //     prevFilters.map((filter) =>
        //         filter.id === filterId
        //             ? {
        //                 ...filter,
        //                 options: filter.options.map((option) =>
        //                     option.id === optionId ? { ...option, checked: !option.checked } : option
        //                 ),
        //             }
        //             : filter
        //     )
        // );
    };

    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const RenderItemComponent = React.memo(({ item, index }) => {
        return (
            <View style={[styles.container, numColumns == 1 ? { flex: 1 } : { width: 200 }]}>
                <View style={styles.cardHeader}>
                    {(item?.availableQuantity > 0) && <Text style={[{ flex: 1, color: 'green' }]}>{fields?.['IN_STOCK']?.fieldValue || 'In Stock'} </Text>}
                    {(item?.availableQuantity == 0 && item?.onOrder == 0) && <Text style={[{ flex: 1, color: colors.red }]}>{fields?.['OUT_OF_STOCK']?.fieldValue || 'Out of Stock'} </Text>}
                    {(0 >= item.availableQuantity && item.onOrder > 0) && <Text style={[{ flex: 1, color: colors.black }]}>{fields?.['COMING_SOON']?.fieldValue || 'Coming Soon'} </Text>}
                    <IconButton icon={() => <MaterialIcons name="favorite" size={23} color={colors.secondary} />} size={15}
                        onPress={() => console.log("Pressed Favorite btn")} />
                </View>
                <IconButton icon={() => <MaterialIcons name="image" size={40} color={colors.secondary} />} style={{ backgroundColor: colors.primary }} size={50}
                    onPress={() => console.log("Pressed Favorite btn")} />
                <Text style={[{ flex: 1, color: colors.black, fontWeight: 'bold' }]}>{item?.itemNumber || 'Items'}</Text>
                {<Text style={[{ flex: 1, color: colors.grey, textAlign: 'center', marginHorizontal: 2 }]}>{currentLanguage == 'ar' ? item?.arabicDescription : item?.description}</Text>}
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
                </View>
                {/* {item?.showHeader && <View style={{ justifyContent: 'space-between' }}>
                    <Text style={{ ...styles.text, fontWeight: 'bold' }}>{item.headerTitile}: {item.headerTitleValue}</Text>
                    <Text style={{ ...styles.text, fontWeight: 'bold' }}>{item.headerDesc}: {item.headerDescValue}</Text>
                </View>}
                <View style={styles.card}>

                    {(item.rows.length ? true : false) && item.rows.map((x, index) => (
                        x.show && <View key={`${item.key}${index}`}
                            style={{ flexDirection: 'row', padding: 0, paddingLeft: 10 }}>
                            <Text style={styles.text}>{x.rowTitle}</Text>
                            <Text style={{ ...styles.text, fontWeight: 'bold', }}>{x.rowValue}</Text>
                        </View>
                    ))}

                    {(buttonTitle.title != '') && < TouchableOpacity style={styles.button} onPress={() => getId(item)}>
                        <Text style={styles.buttonText}>{buttonTitle.title}</Text>
                    </TouchableOpacity>}
                </View> */}
                <Button style={{ backgroundColor: colors.black, color: colors.white, paddingHorizontal: 10, margin: 10 }} mode="contained" onPress={() => getId(item)}>
                    {fields?.['ADD_ITEMS']?.fieldValue || 'Add Items'}
                </Button>
            </View >
        );
    });

    return (
        <>
            {showModal && (
                <TouchableOpacity style={styles.overlay(colors.black)}
                    onPress={() => toggleSidebar(false)}>

                </TouchableOpacity>
            )}
            <Animated.View
                style={[
                    styles.sidebar,
                    { transform: [{ translateX: slideAnim }] }, // Animate slide
                ]}
            >
                <TouchableOpacity
                    onPress={() => toggleSidebar(false)}
                    style={styles.header(colors)}
                >
                    <Text style={styles.headerText(colors)}>
                        {fields?.['FILTERS']?.fieldValue || 'Filters'}
                    </Text>
                    <MaterialIcons name="tune" size={25} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.content}>
                    <ScrollView>
                        <TouchableOpacity onPress={() => toggleExpand('class')} style={styles.accordionHeader}>
                            <Text style={styles.accordionTitle}> {fields?.['CLASS']?.fieldValue || 'Class'}</Text>
                            <MaterialIcons name={accordianExpand.class ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{}} color={colors.grey} />
                        </TouchableOpacity>
                        {
                            accordianExpand.class && !!filters && !!filters?.classSetup && filters?.classSetup?.length && filters?.classSetup.map((item, i) => (
                                <View key={item.id} style={{ ...styles.optionRow, }}>
                                    <Text style={{ color: colors.black }}>{capitalizeFirstLetter(item?.descriptionGrid)}</Text>
                                    <CheckBox
                                        value={isSelected(item?.id, 'class')}
                                        onValueChange={() => setSearchFiltersFunc(item.id, 'class')}
                                        style={{ margin: 0 }}
                                        tintColors={{ true: colors.black, false: colors.grey }} // Toggle checkbox state
                                    />
                                </View>
                            ))
                        }

                        <TouchableOpacity onPress={() => toggleExpand('price')} style={styles.accordionHeader}>
                            <Text style={styles.accordionTitle}> {fields?.['PRICE']?.fieldValue || 'Price'} </Text>
                            <MaterialIcons name={accordianExpand.price ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{}} color={colors.grey} />
                        </TouchableOpacity>
                        {accordianExpand.price && <View style={styles.sliderContainer}>
                            <Slider
                                style={{}}
                                minimumValue={filters?.price[1] || 0}
                                maximumValue={filters?.price[0] || 0}
                                step={100}
                                // onValueChange={(value) => setPriceRange({ ...priceRange, max: value })}
                                onValueChange={(value) => setSearchFiltersFunc(value, 'price')}
                                value={searchFilters.endPrice}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15 }}>
                                <Text style={styles.accordionTitle}>
                                    {filters?.price[1]}
                                </Text>
                                <Text style={{ ...styles.accordionTitle, color: colors.secondary }}>
                                    {searchFilters?.endPrice}
                                </Text>
                                <Text style={styles.accordionTitle}>
                                    {filters?.price[0]}
                                </Text>
                            </View>
                        </View>}
                    </ScrollView>


                    {/* Sidebar content goes here */}
                    {/* <FlatList
                        data={filterArray}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={styles.accordionItem}>
                                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.accordionHeader}>
                                    <Text style={styles.accordionTitle}> {fields?.['CLASS']?.fieldValue || 'Add Items'} </Text>
                                    <MaterialIcons name={item.expanded ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{}} color={colors.grey} />
                                </TouchableOpacity>
                                {item.expanded && (
                                    <View style={styles.optionsContainer}>
                                        {item.options.map((option) => (
                                            <View key={option.id} style={styles.optionRow}>
                                                <Text style={{ color: colors.black }}>{option.label}</Text>
                                                <CheckBox
                                                    value={option.checked}
                                                    onValueChange={() => toggleOption(item.id, option.id)}
                                                    style={{ margin: 0 }}
                                                    tintColors={{ true: colors.black, false: colors.grey }} // Toggle checkbox state
                                                />
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    /> */}
                </View>
            </Animated.View>

            {/* {showModal && <View style={[{ position: 'absolute', backgroundColor: 'white', bottom: 0, top: 0, width: 300, zIndex: 10 }]}>
                <TouchableOpacity onPress={() => setShowModal(false)}
                    style={{ backgroundColor: colors.black, flexDirection: 'row', padding: 10, justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.white, fontSize: 16 }}> {fields?.['FILTERS']?.fieldValue || 'Filters'} </Text>
                    <MaterialIcons name="tune" size={25} style={{}} color={colors.white} />
                </TouchableOpacity>
            </View>} */}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon={() => <MaterialIcons name="tune" size={25} style={{}} color={colors.secondary} />}
                    onPress={() => toggleSidebar(true)} />
                <Searchbar
                    onIconPress={() => console.log(searchKeyword)}
                    icon={() => <MaterialIcons name="search" size={23} color={colors.secondary} />}
                    clearIcon={() => searchKeyword != '' && <MaterialIcons name="close" size={23} color={colors.secondary} />}
                    style={{ backgroundColor: colors.white, marginHorizontal: 10, flex: 1 }}
                    placeholderTextColor={colors.grey}
                    color={colors.black}
                    placeholder={t('search')}
                    onChangeText={setSearchKeyword}
                    value={searchKeyword}
                />
            </View>
            <Text style={styles.headerTitle}>{fields?.['ITEMS']?.fieldValue || 'Items'}</Text>
            <Text style={styles.headerDesc}>{fields?.['SHOWING_ALL']?.fieldValue || 'Showing'} <Text style={{ fontWeight: 'bold', color: colors.black }}>{listData.length}</Text> {t('of')} {totalCount} {fields?.['RESULTS']?.fieldValue || 'Results'}</Text>
            {
                (listData.length == 0 ? false : true) && <FlatList
                    data={listData}
                    keyExtractor={(item, index) => `${String(item.id)}${index}`}
                    onEndReached={loadMore}
                    scrollEnabled={buttonTitle?.nestedScrollCheck || true}
                    onEndReachedThreshold={0.5}
                    numColumns={numColumns}
                    contentContainerStyle={{ justifyContent: 'center', }}
                    renderItem={({ item, index }) => (
                        <RenderItemComponent item={item} index={index} />
                    )}
                    // renderItem={({ item }) => <Text>{item.itemNumber} {`${String(item.id)}`} </Text>}
                    ListFooterComponent={hasMore && <ActivityIndicator color={colors.secondary} size="small" />}
                // ListFooterComponent={() => (
                //     hasMore ? (
                //         <View style={{ flexDirection: 'row' }}>
                //             <ActivityIndicator color={colors.secondary} size="small" />
                //             <Button
                //                 icon="camera"
                //                 style={{ backgroundColor: 'purple', color: colors.white }}
                //                 mode="contained"
                //                 onPress={() => navigation.navigate('QuotationFormScreen')}
                //             >
                //                 {fields?.['LOADING']?.fieldValue || 'Request For Quotation'}
                //             </Button>
                //         </View>
                //     ) : (
                //         <Button
                //             icon="camera"
                //             style={{ backgroundColor: 'purple', marginHorizontal: 20, marginVertical: 8, color: colors.white }}
                //             mode="contained"
                //             onPress={() => navigation.navigate('QuotationFormScreen')}
                //         >
                //             {fields?.['LOADING']?.fieldValue || 'Request For Quotation'}
                //         </Button>
                //     )
                // )}
                />
            }

            {listData.length == 0 && <Text style={{ flex: 1, fontSize: 15, color: 'black', textAlign: 'center', padding: 20 }}>{t('NO_DATA_TO_DISPLAY')}</Text>}
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        // justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderRadius: 10,
        backgroundColor: colors.white
        // paddingHorizontal: 10,
        // backgroundColor:'red',
        // justifyContent: 'center',
        // alignItems: 'center',
        // marginTop: 20,
    },
    cardHeader: {
        // backgroundColor: 'red',
        flexDirection: 'row',
        padding: 5,
        paddingHorizontal: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    headerTitle: {
        padding: 10,
        fontSize: 20,
        color: colors.black,
        fontWeight: 'bold',
    },
    headerDesc: {
        fontSize: 16,
        paddingHorizontal: 10,
        color: colors.grey,
    },
    card: {
        display: 'flex',
        backgroundColor: colors.white,
        marginVertical: 5,
        marginHorizontal: 10,
        padding: 5,
    },
    orderText: {
        fontSize: 17,
        padding: 10,
        fontWeight: 'bold',
        color: '#B5944B'
    },
    text: {
        color: 'black',
        fontSize: 15,
        letterSpacing: .1,
        flex: 1,
        textAlign: 'left'
        // width: 200,
    },
    button: {
        backgroundColor: colors.secondary,
        padding: 5,
        borderRadius: 5,
        margin: 5,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    quantityContainer: {
        marginVertical: 3,
        flexDirection: 'row',
    },
    quantityButton: {
        width: 30,
        height: 30,
        // backgroundColor: '#3B2E4A',
        // backgroundColor: '#d8d5db',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
    },
    quantity: {
        marginHorizontal: 10,
        fontSize: 18,
        color: 'black'
    },
    overlay: (color) => ({
        position: 'absolute',
        backgroundColor: color,
        opacity: 0.4,
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: 5,
    }),
    sidebar: {
        position: 'absolute',
        backgroundColor: 'white',
        bottom: 0,
        top: 0,
        width: 300,
        zIndex: 10,
    },
    header: (colors) => ({
        backgroundColor: colors.black,
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-between',
    }),
    headerText: (colors) => ({
        color: colors.white,
        fontSize: 16,
    }),
    content: {
        flex: 1,
        padding: 10,
    },
    accordionItem: { marginBottom: 10 },
    accordionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    accordionTitle: { fontWeight: 'bold', color: colors.black, },
    optionsContainer: { padding: 10, backgroundColor: '#fff' },
    optionRow: { flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'space-between', alignItems: 'center' },
    sliderContainer: { paddingTop: 10, paddingHorizontal: 5, },
});

export default ItemFilter;
