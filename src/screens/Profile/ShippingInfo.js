import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, TouchableOpacity, I18nManager, ScrollView } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MapView, { Marker } from 'react-native-maps';
import colors from '../../Utils/colors';
import { useDispatch, useSelector } from 'react-redux';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { getCityListByStateId, getCountryList, getStateListByCountryId } from '../../services/auth';
import StructureModal from '../../Shared/structureModal';
import { Searchbar } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Button, IconButton } from 'react-native-paper';
import { saveMaintenanceShippingAddress, shippingAddressByCustomer, deleteShippingAddress } from '../../services/drawerService';
import { ShowToastMessage } from '../../Shared/ShowToastMessage'; import CustomFlaglist from '../../Shared/CustomFlaglist';

const ShippingInfo = ({ fields, permissions, activeCustomer }) => {
    const userData = useSelector((state) => state.auth.user);
    const userDetails = useSelector((state) => state.auth.userDetails);
    const isuserToken = useSelector((state) => state.auth.userToken);
    const [isModalVisible, setModalVisible] = useState(false);
    const [shippingArray, setShippingArray] = useState([]);


    const { t } = useTranslation();
    const [arrCountry, setArrCountry] = useState([]);
    const [arrState, setArrState] = useState([]);
    const [arrCity, setArrCity] = useState([]);
    const [isFocus, setIsFocus] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const selectlanguage = useSelector((state) => state.language.language);
    const { userProfile, token } = useSelector((state) => state.auth);
    const getHeader = async () => {
        const lngId = selectlanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    //validation schema:
    const ShippingValidationSchema = Yup.object({
        // Phone: Yup.string().max(14, t("PHONE_MUST_BE_14")) // Using max() for a maximum length
        Phone: Yup.string() // Using max() for a maximum length
            .required("Phone number is required"),
        Fax: Yup.string().required("Fax number is required"),
        Shipping_Address: Yup.string().required(t("SHIPPING_ADDRESS_IS_REQUIRED")),
        CountrydropdownValue: Yup.string().required(t("COUNTRY_IS_REQUIRED")),
        StatedropdownValue: Yup.string().required(t("STATE_IS_REQUIRED")),
        CitydropdownValue: Yup.string(),
        latitude: Yup.string(),
        longitude: Yup.string()
    });

    const formik = useFormik({
        initialValues: {
            latitude: '',
            longitude: '',
            Phone: '',
            Fax: '',
            Shipping_Address: '',
            CountrydropdownValue: '',
            StatedropdownValue: '',
            CitydropdownValue: '',
            countryId: '',
            stateId: '',
            cityId: '',

        },
        validationSchema: ShippingValidationSchema,
        enableReinitialize: true,
        onSubmit: values => {
            console.log('Form Values:', values);

            submitData();

        },
    });

    const dispatch = useDispatch();

    const setEditData = async () => {
        try {

            // latitude: String(activeCustomer?.latitude || ''),
            // longitude: String(activeCustomer?.longitude || ''),
            // Phone: activeCustomer?.phone1,
            // Fax: activeCustomer?.fax,
            // Shipping_Address: activeCustomer?.shippingAddress,
            // CountrydropdownValue: activeCustomer?.countryName,
            // StatedropdownValue: activeCustomer?.stateName,
            // CitydropdownValue: activeCustomer?.cityName,
            // countryId: activeCustomer?.countryId,
            // stateId: activeCustomer?.stateId,
            // cityId: activeCustomer?.cityId,

        } catch (error) {
            console.error('setEditData error:', error);
        }
    };

    const setProfileInfoFieldsDataApi = async () => {
        try {
            console.log('selectlanguage?.languageId', selectlanguage?.languageId);
            const customHeaders = {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + isuserToken?.access_token,
                'langid': selectlanguage?.languageId,
                'tenantid': userData?.userData?.tenantid,
            };

            const response = await setScreenFieldsData(fields, 'M-SPS', 'S-PROFILE-INFORMATION', customHeaders);
            setFields(response)
        } catch (error) {
            console.error('Server error:', error);
        }
    };

    const apiRequest = async ({ url, method = 'GET', headers = {} }) => {
        dispatch(setLoading());

        try {
            const response = await axios({
                url,
                method,
                headers,
            });

            if (response && response.data && response.data.result) {
                //console.log('Countries Response Data:', response.data.result);
                return response.data.result;
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Error fetching countries data:', error.message);
            if (error.response) {
                console.error('Error Details:', error.response.data);
            }
            throw error;

        } finally {
            setTimeout(() => {
                dispatch(resetLoading());
            }, 1000);
        }
    };

    const getAllShippingAddress = async () => {
        try {
            dispatch(setLoading())
            const headers = await getHeader();
            const response = await shippingAddressByCustomer({ customerId: userProfile?.customerNo }, headers)
            // const formattedData = response.result.map(item => [
            //     item.id ? item.id.toString() : '',
            //     item.countryName ? item.countryName : '',
            //     item.stateName ? item.stateName : '',
            //     item.cityName ? item.cityName : '',
            //     item.shippingAddress1 ? item.shippingAddress1 : '',
            //     item.phoneNumber ? item.phoneNumber : '',
            //     item.fax ? item.fax : '',
            //     item.longitude ? item.longitude.toString() : '',
            //     item.latitude ? item.latitude.toString() : '',
            // ]);
            if (response && (response.code == 200 || response.code == 201) && response?.result && response.result?.length) {
                console.log("response =======> ", response.result?.length);
                const arr = response.result.map((x, index) => {
                    const rand = Math.random() * (100 - 1 + 1) + 1;
                    return {
                        ...x,
                        key: `${x.id}${index}${rand + index}`,
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
                                rowTitle: fields?.['COUNTRY']?.fieldValue || 'Country',
                                rowValue: x?.countryName,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['STATE']?.fieldValue || 'State',
                                rowValue: x?.stateName,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['CITY']?.fieldValue || 'City',
                                rowValue: x?.cityName,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['PHONE']?.fieldValue || 'Phone',
                                rowValue: x?.phoneNumber,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['ADDRESS']?.fieldValue || 'Address',
                                rowValue: x?.shippingAddress1,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['FAX']?.fieldValue || 'Fax',
                                rowValue: x?.fax,
                            },
                            {
                                show: x?.latitude && true,
                                rowTitle: fields?.['LAT']?.fieldValue || 'Latitude',
                                rowValue: x?.latitude,
                            },
                            {
                                show: x?.longitude && true,
                                rowTitle: fields?.['LONG']?.fieldValue || 'Longitude',
                                rowValue: x?.longitude,
                            },
                        ],
                        btnArray: [
                            {
                                title: t('Edit'),
                                type: 'edit',
                                disable: !permissions?.isEditableShippingAddress,

                            },
                            {
                                title: t('Delete'),
                                type: 'delete',

                            },
                        ]
                    }
                })
                setShippingArray([...arr]);
            }
            dispatch(resetLoading());
        } catch (error) {
            console.error("Error fetching data:", error);
            dispatch(resetLoading());
        }
    }

    const CountryList = async () => {
        try {
            const headers = await getHeader();
            const resData = await getCountryList(headers);
            console.log(resData?.result?.length);
            if (resData && resData?.result) {

                const arr = resData?.result.map(x => {
                    return {
                        label: x?.countryName,
                        value: x?.countryId
                    }
                })
                setArrCountry([...arr]);

                const obj = arr.find(x => x.value == formik.values?.countryId)
                console.log('countryId------------------------', obj);
                if (obj) {
                    formik.setFieldValue('CountrydropdownValue', obj.label);
                    StateListByCountryId(obj.value);
                }
            }

        } catch (error) {
            console.log('Error in GEtting CountryList Detail', error);
        }

    };

    const StateListByCountryId = async (index) => {
        try {
            const headers = await getHeader();
            const resData = await getStateListByCountryId({ countryId: index }, headers);
            console.log(resData?.result?.length);
            if (resData && resData?.result) {
                const arr = resData?.result.map(x => {
                    return {
                        label: x?.stateName,
                        value: x?.stateId
                    }
                })
                setArrState([...arr]);
                const obj = arr.find(x => x.value == formik.values?.stateId)
                if (obj) {
                    formik.setFieldValue('StatedropdownValue', obj.label);
                    CityListByStateId(obj.value);
                }
            }

        } catch (error) {
            console.log('Error in GEtting CountryList Detail', error);
        }

    };

    const CityListByStateId = async (index) => {
        try {
            const headers = await getHeader();
            const resData = await getCityListByStateId({ stateId: index }, headers);
            console.log(resData?.result?.length);
            if (resData && resData?.result) {
                const arr = resData?.result.map(x => {
                    return {
                        label: x?.cityName,
                        value: x?.cityId
                    }
                })
                setArrCity([...arr]);
                const obj = arr.find(x => x.value == formik.values?.cityId)
                if (obj) {
                    formik.setFieldValue('CitydropdownValue', obj.label);
                }
            }

        } catch (error) {
            console.log('Error in GEtting CountryList Detail', error);
        }

    };


    useEffect(() => {
        // StateListByCountryId();

    }, [formik.values.CountrydropdownValue]);

    useEffect(() => {
        setShippingArray([]);
        if (activeCustomer) {
            CountryList();
            getAllShippingAddress();
        }

    }, []);

    const deleteRecord = async (recordId) => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const reqBody = {
                id: recordId,
            };
            const response = await deleteShippingAddress(reqBody, headers);
            if (response && (response.code === 200 || response.code === 201)) {
                getAllShippingAddress();
                formik.resetForm();
                ShowToastMessage({ message: response?.btiMessage.message, message2: t('success'), type: "success" });
            } else {
                dispatch(resetLoading());
                ShowToastMessage({ message: response?.btiMessage.message, message2: t('error'), type: "error" });
            }

        } catch (error) {
            console.error("Error saving shipping address:", error);
            dispatch(resetLoading());
        }

    };
    const submitData = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const reqBody = {
                customerId: userProfile?.customerNo,
                lstDtoShippingAddress: [
                    {
                        shippingAddress1: formik.values.Shipping_Address,
                        fax: formik.values.Fax,
                        phoneNumber: formik.values.Phone,
                        cityId: formik.values.cityId,
                        stateId: formik.values.stateId,
                        countryId: formik.values.countryId,
                        latitude: formik.values.latitude,
                        longitude: formik.values.longitude,
                    },
                ],
            };
            const response = await saveMaintenanceShippingAddress(reqBody, headers);
            if (response && response.code === 200) {
                getAllShippingAddress();
                formik.resetForm();
            }
            ShowToastMessage({ message: response?.btiMessage.message, message2: t('success'), type: "success" });
        } catch (error) {
            console.error("Error saving shipping address:", error);
            dispatch(resetLoading());
        }
    };

    const clickOnMap = (event) => {
        try {
            if (event?.nativeEvent?.coordinate) {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                setSelectedLocation({ latitude, longitude })
                formik.setFieldValue('latitude', String(latitude));
                formik.setFieldValue('longitude', String(longitude));
            }
            setModalVisible(false);

        } catch (error) {
            console.log('Error in MAp Fucntion', error);
            dispatch(resetLoading());
        }

    };

    const getClickedId = (event) => {
        if (event.action == 'delete' && event.data?.id) {
            deleteRecord(event.data?.id)

        } else if (event?.action == 'edit') {
            console.log('EditCase-------------');

        }

    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>{fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address'}</Text>
            <TextInput style={styles.input}
                placeholderTextColor={colors.lightgrey}
                value={formik.values.Shipping_Address}
                onChangeText={formik.handleChange('Shipping_Address')}
                onBlur={formik.handleBlur('Shipping_Address')}

            />
            {formik.errors.Shipping_Address && formik.touched.Shipping_Address && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <Text style={styles.label}>{fields?.['COUNTRY']?.fieldValue || 'Country'}</Text>
            <Dropdown
                style={[{ ...styles.input, ...styles.dropdown }, formik.touched.CountrydropdownValue && formik.errors.CountrydropdownValue ? styles.inputError : null,]}
                placeholderStyle={{}}
                selectedTextStyle={{ color: colors.black }}
                inputSearchStyle={{}}
                iconStyle={{}}
                iconColor={colors.black}
                data={arrCountry}
                maxHeight={300}
                search={true}
                labelField="label"
                valueField="label"
                placeholder={t("")}
                searchPlaceholder={t("search")}
                value={formik.values.CountrydropdownValue}
                onChange={item => {
                    formik.setFieldValue('CountrydropdownValue', item.label);
                    formik.setFieldValue('countryId', item.value);
                    setArrState([]);
                    setArrCity([]);
                    StateListByCountryId(item.value);

                }}
            />
            {formik.touched.CountrydropdownValue && formik.errors.CountrydropdownValue && (
                <Text style={styles.errorText}>{t('requiredValid')}</Text>
            )}
            <Text style={styles.label}>{fields?.['STATE']?.fieldValue || 'State'}</Text>
            <Dropdown
                style={[{ ...styles.input, ...styles.dropdown }]}
                placeholderStyle={{}}
                selectedTextStyle={{ color: colors.black }}
                inputSearchStyle={{}}
                iconColor={colors.black}
                iconStyle={{}}
                data={arrState}
                maxHeight={300}
                search={true}
                labelField="label"
                valueField="label"
                placeholder={t("")}
                searchPlaceholder={t("search")}
                value={formik.values.StatedropdownValue}
                onChange={item => {
                    formik.setFieldValue('StatedropdownValue', item.label);
                    formik.setFieldValue('stateId', item.value);
                    setArrCity([]);
                    CityListByStateId(item.value);

                }}
            />
            {formik.touched.StatedropdownValue && formik.errors.StatedropdownValue && (
                <Text style={styles.errorText}>{t('requiredValid')}</Text>
            )}
            <Text style={styles.label}>{fields?.['CITY']?.fieldValue || 'City'}</Text>
            <Dropdown
                style={[{ ...styles.input, ...styles.dropdown }, formik.touched.CitydropdownValue && formik.errors.CitydropdownValue ? styles.inputError : null,]}
                placeholderStyle={styles2.placeholderStyle}
                selectedTextStyle={{ color: colors.black }}
                inputSearchStyle={styles2.inputSearchStyle}
                iconStyle={styles2.iconStyle}
                data={arrCity}
                maxHeight={300}
                search={true}
                labelField="label"
                valueField="label"
                placeholder={t("")}
                searchPlaceholder={t("search")}
                value={formik.values.CitydropdownValue}
                onChange={item => {
                    formik.setFieldValue('CitydropdownValue', item.label);
                    formik.setFieldValue('cityId', item.value);
                }}
            />
            {formik.touched.CitydropdownValue && formik.errors.CitydropdownValue && (
                <Text style={styles.errorText}>{t('requiredValid')}</Text>
            )}

            <Text style={styles.label}>{fields?.['PHONE']?.fieldValue || 'Phone'}</Text>
            <TextInput style={[styles.input,]}
                keyboardType="phone-pad"
                placeholderTextColor={colors.lightgrey}
                value={formik.values.Phone}
                onChangeText={formik.handleChange('Phone')}
                onBlur={formik.handleBlur('Phone')}

            />
            {formik.errors.Phone && formik.touched.Phone && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <Text style={styles.label}>{fields?.['FAX']?.fieldValue || 'Fax'}</Text>
            <TextInput style={[styles.input,]}
                placeholderTextColor={colors.lightgrey}
                keyboardType="phone-pad"
                value={formik.values.Fax}
                onChangeText={formik.handleChange('Fax')}
                onBlur={formik.handleBlur('Fax')}

            />
            {formik.errors.Fax && formik.touched.Fax && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <Text style={styles.label}>{fields?.['LAT']?.fieldValue || 'Latitude'}</Text>
            <TextInput style={[styles.input,]}
                placeholderTextColor={colors.lightgrey}
                value={formik.values.latitude}
                onChangeText={formik.handleChange('latitude')}
                onBlur={formik.handleBlur('latitude')}
                keyboardType="phone-pad"

            />

            <Text style={styles.label}>{fields?.['LONG']?.fieldValue || 'Longitude'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput style={[styles.input, { flex: 1 }]}
                    placeholderTextColor={colors.lightgrey}
                    value={formik.values.longitude}
                    onChangeText={formik.handleChange('longitude')}
                    onBlur={formik.handleBlur('longitude')}
                    keyboardType="phone-pad"
                />
                <IconButton icon={() => <MaterialIcons name="location-on" size={20} color={colors.white} />} size={25}
                    style={{ backgroundColor: colors.secondary, margin: 0, borderRadius: 5 }} onPress={() => setModalVisible(true)} />
            </View>
            <View style={styles.bottomRow}>
                <Button style={styles.bottonBtn} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.handleSubmit()} mode="contained" >
                    {t('save')}
                </Button>
                <Button style={{ ...styles.bottonBtn, backgroundColor: colors.black }} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.resetForm()} mode="contained" >
                    {t('clear')}
                </Button>
            </View>
            <CustomFlaglist listData={shippingArray} getId={getClickedId}
                buttonTitle={{
                    show: true,
                    nestedScrollCheck: false,
                }} />
            <StructureModal
                visibilityCheck={isModalVisible}
                modalTitle={t('map')}
                onClose={clickOnMap}
                onSearch={false}
                // setKeyword={setSearchKeyword}
                RenderContent={() => (
                    <MapView
                        style={{ flex: 1 }}
                        onPress={clickOnMap}
                        initialRegion={{
                            latitude: 21.422487,
                            longitude: 39.826206,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker coordinate={selectedLocation ? selectedLocation : { latitude: 21.422487, longitude: 39.826206 }} />
                    </MapView>
                )
                }
            />

            {/* <View style={{ marginBottom: 20 }} >
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View>
                        <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C1C1' }}>
                            <Row
                                data={dummyData.tableHead}
                                widthArr={dummyData.widthArr}
                                style={styles2.header}
                                textStyle={styles2.Headertext}
                            />
                        </Table>
                        <ScrollView style={styles.dataWrapper} >
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C1C1' }}>
                                {dummyData.data.map((rowData, index) => (
                                    <Row
                                        key={index}
                                        data={rowData}
                                        widthArr={dummyData.widthArr}
                                        // style={[styles2.row, index % 2 && { backgroundColor: '#F2EAFB' }]}
                                        textStyle={styles2.text}
                                    />
                                ))}
                            </Table>
                        </ScrollView>
                    </View>
                </ScrollView>
            </View> */}
        </ScrollView>
    )
}

const commonStyles = StyleSheet.create({

});
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: 16,
        flex: 1,
    },
    input: {
        marginVertical: 5,
        borderColor: colors.grey,
        color: colors.black,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 13,
    },
    label: {
        flex: 1,
        textAlign: 'left',
        color: colors.black,
        fontSize: 16,
    },
    errorText: {
        color: colors.red,
        fontSize: 10,
    },
    dropdown: {
        padding: 13,
    },
    disableInput: {
        backgroundColor: colors.lightgrey
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
    shippingCard: {
        padding: 10,
        borderWidth: .3,
        borderColor: colors.grey,
        borderRadius: 5,
        marginBottom: 5,
    }

});
const styles2 = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        padding: 16,
        flex: 1,
    },
    iconStyle: {
        width: 20,
        height: 20,
        tintColor: 'black',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#333',
    },
    optionContainer: {
        padding: 10,
        backgroundColor: 'white',
        textAlign: 'left',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'left',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    disabledbutton: {
        flex: 1,
        backgroundColor: '#A9A9A9',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
        opacity: 0.6,
    },
    returnButton: {
        backgroundColor: '#DC3545',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
        marginHorizontal: 5
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: I18nManager.isRTL ? 'Cairo-Regular' : 'Inter-Regular'
    },
    HeeaderText: {
        color: 'black',
        fontSize: 20,
        marginVertical: 15,
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bold'
    },
    HeeaderTextar: {
        color: 'black',
        fontSize: 30,
        marginBottom: 15,
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bold',
        textAlign: 'left'
    },
    header: {
        paddingHorizontal: 5,
        height: 35,
        backgroundColor: '#3B2E4A',
        color: 'white',


    },

    row: {
        paddingHorizontal: 5,
        height: 'auto',
        backgroundColor: '#ffffff',
        color: '#000000',
    },
    dataWrapper: {
        marginTop: -1,
    },
    text: {
        textAlign: 'left',
        fontWeight: '400',
        color: 'black',
        paddingHorizontal: 5,
        flexWrap: 'wrap',

    },
    Numbertext: {
        color: '#3B2E4A',
        fontSize: 26,
        fontWeight: '500',
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bold'
    },
    Headertext: {
        textAlign: 'center',
        fontWeight: '500',
        color: 'white',
        fontFamily: I18nManager.isRTL ? 'Cairo-Bold' : 'Inter-Bold'

    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default ShippingInfo