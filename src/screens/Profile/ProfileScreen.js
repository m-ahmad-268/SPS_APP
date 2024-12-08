import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollView, StyleSheet, TextInput, Text, View, SafeAreaView, TouchableOpacity, Platform, I18nManager, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../Utils/colors';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
import { setScreenFieldsData } from '../../services/auth';
import { Button, DataTable, IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileForm from './ProfileForm';
import { getAll, maintenanceGetById, updateMaintenance } from '../../services/drawerService';
import BillingInfo from './BillingInfo';
import ShippingInfo from './ShippingInfo';
import DocumentsProfile from './DocumentsProfile';
import { ShowToastMessage } from '../../Shared/ShowToastMessage';
// import { setLoading, resetLoading } from '../../slices/loadingSlice';
// import BillingAddress from './BillingAddress';
// import ShippingAddress from './ShippingAddress';
// import LoyaltyPoints from './LoyaltyPoints';
// import CommingSoon from '../CommingSoon';
// import Coupons from './Coupons';
// import showToast from '../../utils/toast';
// import commonStyles from '../../common/common.styles';
// import LocationPin from '../../../assets/images/location-pin.svg'
// import DropdownIcon from '../../../assets/images/dropdown-arrow.svg'

const ProfileScreen = React.memo(({ navigation, route }) => {
    const [selectedTab, setSelectedTab] = useState('profile');
    const [DetailedUserData, setDetailedUserData] = useState();
    const [editablePermissions, setEditablePermissions] = useState({});
    const [fields, setFields] = useState([]);
    const [onSubmit, setOnSubmit] = useState({});
    const [customerDetail, setCustomerDetail] = useState(null);
    const selectlanguage = useSelector((state) => state.language.language);
    const { userProfile, token } = useSelector((state) => state.auth);
    const userDetails = useSelector((state) => state.auth.userDetails);
    const isuserToken = useSelector((state) => state.auth.userToken);
    const { t } = useTranslation();
    const isComeFromCartScreen = route?.params?.isComeFromCartScreen || false;
    const getHeader = async () => {
        const lngId = selectlanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }
    const dispatch = useDispatch();
    const customerId1 = userDetails?.customerId ? userDetails?.customerId : null;
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([2, 3, 4]);
    const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[0]);
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
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },
    ]);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);


    // useEffect(() => {
    //     if (isComeFromCartScreen) {
    //         setSelectedTab('Shipping Address')
    //     }
    // }, [isComeFromCartScreen]);


    const setLoyaltyFieldsDataApi = async () => {
        try {
            const customHeaders = {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + isuserToken?.access_token,
                'langid': selectlanguage?.languageId,
                'tenantid': userData?.userData?.tenantid,
            };

            const response = await setScreenFieldsData(fields, 'M-SPS', 'S-LOYALTY-POINTS-HISTORY', customHeaders);
            setFields(response)
            //console.log("My Profile response1 ===============", response);
        } catch (error) {
            console.error('Server error:', error);
        }
    };
    const getPermissions = async () => {
        try {
            dispatch(setLoading());
            const header = await getHeader();
            const response = await getAll({ custnumber: userProfile.customerNo }, header);
            if (response && response?.result && response?.code == 200) {
                setEditablePermissions(response?.result);

                // dispatch(resetLoading())
            }
            else {
                setEditablePermissions({})
                // dispatch(resetLoading())
            }
            //console.log("My Profile response1 ===============", response);
        } catch (error) {
            console.error('getPermissions error:', error);
            dispatch(resetLoading());
        }
    };

    const GetById = async () => {
        try {
            dispatch(setLoading());
            const header = await getHeader();
            const response = await maintenanceGetById({ customerId: userProfile?.customerNo }, header);
            // console.log(response);

            if (response && response?.result) {
                setCustomerDetail(response.result);
            }
            else {
                dispatch(resetLoading())
                setCustomerDetail({})
                // dispatch(resetLoading())
            }
            //console.log("My Profile response1 ===============", response);
        } catch (error) {
            console.error('setCustomerDetail error:', error);
            dispatch(resetLoading());
        }
    };

    const updateCustomerData = async (event) => {
        try {
            dispatch(setLoading());
            const header = await getHeader();
            const response = await updateMaintenance(event, header);
            if (response && response.code == 200 && response?.result) {
                GetById();
                ShowToastMessage({ message: response?.btiMessage?.message, type: 'success' });
                // dispatch(resetLoading())
            } else {
                ShowToastMessage({ message: response?.btiMessage?.message, type: 'error' });
                dispatch(resetLoading());

            }

            //console.log("My Profile response1 ===============", response);
        } catch (error) {
            console.error('setCustomerDetail error:', error);
            dispatch(resetLoading());
        }
    };

    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-PROFILE-INFORMATION", { 'langid': selectlanguage == 'ar' ? 2 : 1 });
            setFields(response);
            dispatch(resetLoading());
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    };

    useEffect(() => {
        setScreenFieldsDataApi();
        getPermissions();
        GetById();
        // setLoyaltyFieldsDataApi()
        // setProfileInfoFieldsDataApi()
    }, [selectlanguage]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{ marginHorizontal: 5, marginVertical: 10, }}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                    style={{ borderColor: colors.secondary, paddingBottom: 20, borderBottomWidth: 1 }}
                >
                    <Button style={[styles.btn, selectedTab == 'profile' && { ...styles.activeTab }]} labelStyle={[selectedTab == 'profile' ? { color: colors.white } : { color: colors.grey }]} onPress={() => setSelectedTab('profile')} mode="contained" >
                        {fields?.['PROFILE_INFORMATION']?.fieldValue || 'Profile Information'}
                    </Button>
                    <Button style={[styles.btn, selectedTab == 'billing' && { ...styles.activeTab }]} labelStyle={[selectedTab == 'billing' ? { color: colors.white } : { color: colors.grey }]} onPress={() => setSelectedTab('billing')} mode="contained" >
                        {fields?.['BILLING_ADDRESS']?.fieldValue || 'Billing Address'}
                    </Button>
                    <Button style={[styles.btn, selectedTab == 'shipping' && { ...styles.activeTab }]} labelStyle={[selectedTab == 'shipping' ? { color: colors.white } : { color: colors.grey }]} onPress={() => setSelectedTab('shipping')} mode="contained" >
                        {fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address'}
                    </Button>
                    <Button style={[styles.btn, selectedTab == 'documents' && { ...styles.activeTab }]} labelStyle={[selectedTab == 'documents' ? { color: colors.white } : { color: colors.grey }]} onPress={() => setSelectedTab('documents')} mode="contained" >
                        {fields?.['DOCUMENTS']?.fieldValue || 'Documents'}
                    </Button>
                    {/* <Button style={[styles.btn, selectedTab == 'loyality' && { ...styles.activeTab }]} labelStyle={[selectedTab == 'loyality' ? { color: colors.white } : { color: colors.grey }]} onPress={() => setSelectedTab('loyality')} mode="contained" >
                        {fields?.['LOYALTY_POINTS_HISTORY']?.fieldValue || 'Loaylity Points History'}
                    </Button>
                    <Button style={[styles.btn, selectedTab == 'coupons' && { ...styles.activeTab }]} labelStyle={[selectedTab == 'coupons' ? { color: colors.white } : { color: colors.grey }]} onPress={() => setSelectedTab('coupons')} mode="contained" >
                        {fields?.['COUPONS_HISTORY']?.fieldValue || 'Coupons History'}
                    </Button> */}
                </ScrollView>
            </View>

            {selectedTab == 'profile' && <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} >
                <View style={{ ...styles.alignCenter, marginHorizontal: 10, marginTop: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green, marginHorizontal: 10, paddingHorizontal: 10, borderRadius: 3 }}>
                        <IconButton icon={() => <MaterialIcons name="fiber-manual-record" size={10} color={colors.white} />} size={1}
                            style={{ backgroundColor: colors.green, margin: 0, }} onPress={() => console.log('Pressed')} />
                        <Text style={{ color: colors.white, fontSize: 14, padding: 1 }}>
                            {fields?.['ACTIVE']?.fieldValue || 'Active'}
                        </Text>
                    </TouchableOpacity>
                    <IconButton icon={() => <MaterialIcons name="notifications" size={25} color={colors.secondary} />} size={20}
                        style={{ backgroundColor: colors.backgroundLight, marginVertical: 0 }} onPress={() => console.log('Pressed')} />
                </View>
                <View style={styles.alignCenter}>
                    <Image
                        source={require('../../assets/images/user-module.png')}
                        style={{ width: 100, height: 100 }}
                    />
                    <IconButton icon={() => <MaterialIcons name="delete" size={18} color={colors.secondary} />} color="red" size={10}
                        style={{ backgroundColor: colors.backgroundLight, marginVertical: 0, marginTop: -10 }} onPress={() => console.log('Pressed')} />
                </View>
                <View style={styles.alignCenter}>
                    <Text style={{ fontSize: 18, color: colors.black }}>{userProfile?.secondaryFullName}</Text>
                    <Text style={{ fontSize: 13, marginTop: -3, color: colors.secondary, fontWeight: 'bold' }}>{userProfile?.customerId}</Text>
                    <Text style={{ fontSize: 14, color: colors.white, fontWeight: '500', backgroundColor: colors.secondary, padding: 10, borderRadius: 5, margin: 10 }}>
                        {fields?.['COMPANY']?.fieldValue || 'Company'}: {userProfile?.currentCompany || ''}
                    </Text>
                </View>
                <ProfileForm
                    fields={fields}
                    permissions={editablePermissions}
                    activeCustomer={customerDetail}
                    onClickSubmit={updateCustomerData}
                />
            </ScrollView>}
            {selectedTab === 'billing' && (
                <BillingInfo
                    fields={fields}
                    permissions={editablePermissions}
                    activeCustomer={customerDetail}
                    onClickSubmit={updateCustomerData}
                />
            )}
            {selectedTab === 'shipping' && (
                <ShippingInfo
                    fields={fields}
                    permissions={editablePermissions}
                    activeCustomer={customerDetail}
                />)}
            {selectedTab === 'documents' && (
                <DocumentsProfile
                    fields={fields}
                    permissions={editablePermissions}
                    activeCustomer={customerDetail}
                />


                // <ScrollView style={{ margin: 10 }} horizontal={true}>
                //     <DataTable style={{ backgroundColor: colors.white }}>
                //         <DataTable.Header textStyle={{ color: 'red' }} style={{ backgroundColor: colors.black, color: colors.white, borderBottomWidth: 0 }}>
                //             <DataTable.Title textStyle={styles.headerText} style={styles.column}>Dessert </DataTable.Title>
                //             <DataTable.Title textStyle={styles.headerText} style={styles.column}>Dessert</DataTable.Title>
                //             <DataTable.Title textStyle={styles.headerText} style={styles.column}>Dessert</DataTable.Title>
                //             <DataTable.Title textStyle={styles.headerText} style={styles.column}>Dessert</DataTable.Title>
                //             <DataTable.Title textStyle={styles.headerText} style={styles.column}>Calories</DataTable.Title>
                //             <DataTable.Title textStyle={styles.headerText} style={styles.column}>Fat</DataTable.Title>
                //         </DataTable.Header>
                //         <ScrollView style={{ paddingBottom: 40, marginBottom: 10, }}>
                //             {items.slice(from, 1000).map((item, index) => (
                //                 <DataTable.Row style={{ borderBottomWidth: 0 }} key={index}>
                //                     <DataTable.Cell textStyle={styles.dataText} style={styles.column}>{item.name}</DataTable.Cell>
                //                     <DataTable.Cell textStyle={styles.dataText} style={styles.column}>{item.name}</DataTable.Cell>
                //                     <DataTable.Cell textStyle={styles.dataText} style={styles.column}>{item.name}</DataTable.Cell>
                //                     <DataTable.Cell textStyle={styles.dataText} style={styles.column}>{item.name}</DataTable.Cell>
                //                     <DataTable.Cell textStyle={styles.dataText} style={styles.column}>{item.calories}</DataTable.Cell>
                //                     <DataTable.Cell textStyle={styles.dataText} style={styles.column}>
                //                         <IconButton icon={() => <MaterialIcons name="fiber-manual-record" size={10} color={colors.white} />} size={1}
                //                             style={{ backgroundColor: colors.green, margin: 0, }} onPress={() => console.log('Pressed')} />
                //                     </DataTable.Cell>
                //                 </DataTable.Row>
                //             ))}
                //         </ScrollView>
                //     </DataTable>
                // </ScrollView>

            )}
            {/* {selectedTab === 'Billing Address' && EditablePermissions && (
                        <BillingAddress permissions={EditablePermissions} />
                    )}
                    {selectedTab === 'Shipping Address' && <ShippingAddress dto={DetailedUserData} permissions={EditablePermissions} />}

                    {selectedTab === 'Loyalty Points' && <LoyaltyPoints />}

                    {selectedTab === 'Coupons' && <Coupons />} */}
            {/* <View style={styles.footer}>
                <FooterNavigator navigation={navigation} />
            </View> */}
        </SafeAreaView >
    );
});

const styles = StyleSheet.create({
    alignCenter: {
        // backgroundColor: 'aqua',
        alignItems: 'center',
    },
    mainContainerAr: {
        marginLeft: Platform.select({
            ios: 12
        })
    },
    column: {
        width: 120,
        height: 50,
        // padding: 5,
        color: 'white',
        justifyContent: "center",
    },
    headerText: {
        color: colors.white,
    },
    dataText: {
        color: colors.black,
    },
    HeeaderText: {
        color: 'black',
        fontSize: 30,
        marginBottom: 15,
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bold'
    },
    HeeaderTextar: {
        color: 'black',
        fontSize: 30,
        marginBottom: 15,
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bold',
        textAlign: 'left'
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        color: 'black',
        fontSize: 16,
        marginBottom: 5,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        writingDirection: I18nManager.isRTL ? 'Left' : 'Right',
        color: 'black',
    },
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: Platform.select({
            ios: 35
        }),
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        fontFamily: 'Inter'
    },
    btn: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: .7,
        borderRadius: 5,
        marginRight: 5,
        justifyContent: 'center',
        borderColor: colors.grey,
    },
    tab: {
        borderWidth: 1,
        borderColor: colors.lightgrey,
        borderRadius: 5,
    },
    activeTab: {
        backgroundColor: colors.secondary,
        borderWidth: 0,
    },
    tabText: {
        width: 55,
        fontSize: 13,
        color: '#333',
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    activeTabText: {
        width: 55,
        fontSize: 13,
        color: 'black',
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bol'
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        color: 'black',
        fontSize: 16,
        marginBottom: 5,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    labelar: {
        color: 'black',
        fontSize: 16,
        marginBottom: 5,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular',
        textAlign: 'left'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular',
        color: '#000',
    },
    couponsContainer: {
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderColor: '#ddd'
    },
    couponsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#3B2E4A',
        padding: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    headerText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    couponItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    couponText: {
        flex: 1,
        fontSize: 10,
        paddingHorizontal: 3,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    noRecordText: {
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#999',
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    billingButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 15,
        paddingBottom: 20,
        marginLeft: Platform.select({
            ios: '40%',
            android: '30%'
        })
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 15,
        paddingBottom: 20,
        marginLeft: Platform.select({
            ios: '15%'
        })
    },
    button: {
        padding: 10,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: 'white',
    },
    dropdown: {
        borderColor: '#cccccc',
        borderWidth: 1,
    },
    footer: Platform.select({
        ios: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
        android: {
            height: 60,
            width: '100%',
            justifyContent: 'flex-end',
        },
    }),
});

export default ProfileScreen;