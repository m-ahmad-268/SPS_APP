import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
// Define validation schema
const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    arabicName: Yup.string().required('Arabic Name is required'),
    shortName: Yup.string()
        .max(39, 'Short name must be less than 40 characters') // Using max() for a maximum length
        .nullable(),
    phone1: Yup.string()
        // .matches(/^\d+$/, 'Phone number must contain only digits')
        .max(14, 'Phone number must be 14 characters or less')
        .required('Phone number is required'),
    // Using max() for a maximum length
    fax: Yup.string().nullable(),
    Address: Yup.string().required(),
    shippingAddress: Yup.string().required("Shipping Address is required"),
    CountrydropdownValue: Yup.string().required('Country is required'),
    StatedropdownValue: Yup.string().required('State is required'),
    CitydropdownValue: Yup.string().required('City is required'),
    latitude: Yup.string(),
    longitude: Yup.string()
});

const ProfileForm = React.memo(({ fields, permissions, activeCustomer, onClickSubmit }) => {

    const [DetailedUserData, setDetailedUserData] = useState({});
    const [countryDropdownOpen, setCountyDropdownOpen] = useState(false);
    const [activeCountry, setActiveCountry] = useState(null);
    const [activeState, setActiveState] = useState(null);
    const [activeCity, setActiveCity] = useState(null);
    const [renderObj, setRenderObj] = useState(null);
    const [arrCountry, setArrCountry] = useState([]);
    const [arrState, setArrState] = useState([]);
    const [arrCity, setArrCity] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredArray, setFilteredArray] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const selectlanguage = useSelector((state) => state.language.language);
    const { userProfile, token } = useSelector((state) => state.auth);
    const getHeader = async () => {
        const lngId = selectlanguage == 'ar' ? '2' : '1';
        return { langid: lngId, userid: userProfile?.userId, session: userProfile?.session, tenantid: userProfile?.tenantid };
    }

    const formik = useFormik({
        initialValues: {
            name: activeCustomer?.name || '',
            arabicName: activeCustomer?.arabicName || '',
            shortName: activeCustomer?.shortName || '',
            phone1: activeCustomer?.phone1 || '',
            email: activeCustomer?.email || '',
            fax: activeCustomer?.fax || '',
            Address: activeCustomer?.address1 || null,
            shippingAddress: activeCustomer?.shippingAddress || '',
            CountrydropdownValue: activeCustomer?.countryName || '',
            StatedropdownValue: activeCustomer?.stateName || '',
            CitydropdownValue: activeCustomer?.cityName || '',
            countryId: activeCustomer?.countryId || '',
            stateId: activeCustomer?.stateId || '',
            cityId: activeCustomer?.cityId || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: values => {
            try {
                let reqbody = {
                    ...activeCustomer,
                }
                reqbody.lstDtoCustomerMaintenanceLang[0].name = values.name;
                reqbody.lstDtoCustomerMaintenanceLang[1].name = values.arabicName;
                reqbody.shortName = values.shortName;
                reqbody.phone1 = values.phone1;
                reqbody.fax = values.fax;
                reqbody.shippingAddress = values.shippingAddress;
                reqbody.shippingAddress = values.shippingAddress;

                reqbody.countryId = values.countryId;
                reqbody.countryName = values.CountrydropdownValue;
                reqbody.stateName = values.StatedropdownValue;
                reqbody.stateId = values.stateId;
                reqbody.cityName = values.CitydropdownValue;
                reqbody.cityId = values.cityId;

                onClickSubmit(reqbody);

            } catch (error) {
                console.log('onSubmit-------------', error);
                dispatch(resetLoading());

            }

        },
    });

    const CountryList = async () => {
        try {
            const headers = await getHeader();
            const resData = await getCountryList(headers);
            if (resData && resData?.result) {
                const arr = resData?.result.map(x => {
                    return {
                        ...x,
                        label: x?.countryName,
                        value: x?.countryId
                    }
                })
                setArrCountry([...arr]);
                const countryId = await activeCustomer?.countryId;
                const obj = arr.find(x => x.value == countryId)
                console.log('countryId------------------------', obj);
                console.log('activeCustomer------------------------', activeCustomer?.countryId);
                if (obj) {
                    setActiveCountry({ ...obj });
                    StateListByCountryId(obj.value)
                }
            }

        } catch (error) {
            console.log('Error in GEtting CountryList Detail', error);
        }

    };

    const CityListByStateId = async (id) => {
        try {
            const headers = await getHeader();
            const resData = await getCityListByStateId({ stateId: id }, headers);
            if (resData && resData?.result) {
                const arr = resData?.result.map(x => {
                    return {
                        label: x?.cityName,
                        value: x?.cityId
                    }
                })
                setArrCity([...arr]);
                const cityId = await activeCustomer?.cityId;
                const obj = arr.find(x => x.value == cityId)
                if (obj) {
                    setActiveCity({ ...obj });
                }
            }

        } catch (error) {
            console.log('Error in GEtting CountryList Detail', error);
        }

    };

    const StateListByCountryId = async (id) => {
        try {
            const headers = await getHeader();
            const resData = await getStateListByCountryId({ countryId: id }, headers);
            if (resData && resData?.result) {
                const arr = resData?.result.map(x => {
                    return {
                        label: x?.stateName,
                        value: x?.stateId
                    }
                })
                setArrState([...arr]);
                const stateId = await activeCustomer?.stateId;
                const obj = arr.find(x => x.value == stateId)
                if (obj) {
                    setActiveState({ ...obj });
                    CityListByStateId(obj.value);
                }
            }

        } catch (error) {
            console.log('Error in GEtting CountryList Detail', error);
        }

    };

    // useEffect(() => {
    //     if (onClickSubmit.action == 'submit') {
    //         formik.handleSubmit();
    //     } else {
    //         formik.resetForm();
    //     }
    // }, [onClickSubmit]);



    useEffect(() => {
        console.log('Profile Info Screen-----------------');
        dispatch(resetLoading());
        // if (!(arrCountry.length))
        if (activeCustomer) {
            CountryList();
        }

        // }
    }, [activeCustomer]);

    const handleDropdownChange = (label) => {
        if (label == 1) {
            setRenderObj({
                label: 'COUNTRY',
                obj: { ...activeCountry },
                arr: [...arrCountry]
            })
        }
        else if (label == 2) {
            setRenderObj({
                label: 'STATE',
                obj: { ...activeState },
                arr: [...arrState]
            })
        }
        else if (label == 3) {
            setRenderObj({
                label: 'CITY',
                obj: { ...activeCity },
                arr: [...arrCity]
            })
        }

    };

    useEffect(() => {
        if (searchKeyword != '' && renderObj?.arr?.length) {
            const newData = renderObj.arr.filter(item =>
                item.label.toLowerCase().includes(searchKeyword.toLowerCase())
            );
            setFilteredArray(newData);
        }

    }, [searchKeyword]);



    useEffect(() => {
        console.log(renderObj?.label, countryDropdownOpen);
        if (renderObj) {
            setCountyDropdownOpen(true);
        }
    }, [renderObj])

    const onCLoseModal = async (item) => {
        if (item) {
            if (renderObj?.label == 'COUNTRY') {
                setActiveCountry({ ...item });
                console.log(item);

                formik.setFieldValue('CountrydropdownValue', item.label);
                formik.setFieldValue('countryId', item.value);
                formik.setFieldValue('StatedropdownValue', '');
                formik.setFieldValue('CitydropdownValue', '');
                setActiveState(null);
                setActiveCity(null);
                StateListByCountryId(item.value)
            }
            else if (renderObj?.label == 'STATE') {
                setActiveState({ ...item });
                formik.setFieldValue('StatedropdownValue', item.label);
                formik.setFieldValue('stateId', item.value);
                setActiveCity(null);
                CityListByStateId(item.value);
                formik.setFieldValue('CitydropdownValue', '');
            }
            else if (renderObj?.label == 'CITY') {
                setActiveCity({ ...item });
                formik.setFieldValue('CitydropdownValue', item.label);
                formik.setFieldValue('cityId', item.value);
            }
        }
        setSearchKeyword('');
        setCountyDropdownOpen(false);
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.singleItem} onPress={() => onCLoseModal(item)} >
                <Text style={{ color: colors.black, fontSize: 14, }}> {item?.label}</Text>
                {(item?.value == renderObj?.obj?.value) && <IconButton icon={() => <MaterialIcons name={'check'} size={20} style={{ margin: 0 }} color={colors.secondary} />}
                    onPress={() => console.log("Pressed Favorite btn")} size={10} style={{ margin: 0 }} />}

            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.label}>{fields?.['NAME']?.fieldValue || 'Name'}</Text>
                <TextInput
                    style={[styles.input, !(permissions?.isEditableName) && styles.disableInput]}
                    value={formik.values.name}
                    onChangeText={formik.handleChange('name')}
                    maxLength={50}
                    editable={permissions?.isEditableName}
                    placeholderTextColor={colors.lightgrey}
                    placeholder="" />
                {formik.errors.name && formik.touched.name && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}

            </View>
            <View>
                <Text style={styles.label}>{fields?.['ARABIC_NAME']?.fieldValue || 'Arabic Name'}</Text>
                <TextInput
                    style={[styles.input, !(permissions?.isEditableArabicName) && styles.disableInput]}
                    value={formik.values.arabicName}
                    onChangeText={formik.handleChange('arabicName')}
                    maxLength={50}
                    editable={permissions?.isEditableArabicName}
                    placeholderTextColor={colors.lightgrey}
                    placeholder="" />
                {formik.errors.arabicName && formik.touched.arabicName && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            </View>
            <View>
                <Text style={styles.label}>{fields?.['SHORT_NAME']?.fieldValue || 'Short Name'}</Text>
                <TextInput
                    style={[styles.input, !(permissions?.isEditableShortName) && styles.disableInput]}
                    value={formik.values.shortName}
                    onChangeText={formik.handleChange('shortName')}
                    maxLength={50}
                    editable={permissions?.isEditableShortName}
                    placeholderTextColor={colors.lightgrey}
                    placeholder="" />
                {formik.errors.shortName && formik.touched.shortName && (<Text style={styles.errorText}>{formik.errors.shortName}</Text>)}
            </View>
            <View>
                <Text style={styles.label}>{fields?.['PHONE']?.fieldValue || 'Phone'}</Text>
                <TextInput
                    style={[styles.input, !(permissions?.isEditablePhone) && styles.disableInput]}
                    value={formik.values.phone1}
                    onChangeText={formik.handleChange('phone1')}
                    maxLength={50}
                    number={true}
                    editable={permissions?.isEditablePhone}
                    placeholderTextColor={colors.lightgrey}
                    placeholder="" />
                {formik.errors.phone1 && formik.touched.phone1 && (<Text style={styles.errorText}>{formik.errors.phone1}</Text>)}
            </View>
            <View>
                <Text style={styles.label}>{fields?.['EMAIL']?.fieldValue || 'Email'}</Text>
                <TextInput
                    style={[styles.input, styles.disableInput]}
                    value={formik.values.email}
                    onChangeText={formik.handleChange('email')}
                    maxLength={50}
                    placeholderTextColor={colors.lightgrey}
                    editable={false}
                    placeholder="" />
                {formik.errors.email && formik.touched.email && (<Text style={styles.errorText}>{formik.errors.email}</Text>)}
            </View>
            <View>
                <Text style={styles.label}>{fields?.['FAX']?.fieldValue || 'Fax'}</Text>
                <TextInput
                    style={[styles.input, !(permissions?.isEditableFax) && styles.disableInput]}
                    value={formik.values.fax}
                    onChangeText={formik.handleChange('fax')}
                    maxLength={50}
                    placeholderTextColor={colors.lightgrey}
                    editable={permissions?.isEditableFax}
                    placeholder="" />
                {formik.errors.fax && formik.touched.fax && (<Text style={styles.errorText}>{formik.errors.fax}</Text>)}
            </View>
            <View>
                <Text style={styles.label}>{fields?.['SHIPPING_ADDRESS']?.fieldValue || 'Shipping Address'}</Text>
                <TextInput
                    style={[styles.input, !(permissions?.isEditableAddress) && styles.disableInput]}
                    value={formik.values.shippingAddress}
                    onChangeText={formik.handleChange('shippingAddress')}
                    maxLength={50}
                    placeholderTextColor={colors.lightgrey}
                    editable={permissions?.isEditableAddress}
                    placeholder="" />
                {formik.errors.shippingAddress && formik.touched.shippingAddress && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            </View>
            <Text style={styles.label}>{fields?.['COUNTRY']?.fieldValue || 'Country'}</Text>
            <TouchableOpacity style={[{ ...styles.input, ...styles.dropDownStyle }, !(permissions?.isEditableCountry) && styles.disableInput]}
                onPress={() => (permissions?.isEditableCountry) && handleDropdownChange(1)}>
                <Text style={{ color: colors.black }}>{formik?.values.CountrydropdownValue}</Text>
                <IconButton icon={() => <MaterialIcons name={true ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{ margin: 0 }} color={colors.black} />}
                    style={{ marginHorizontal: 0 }} size={16} />
            </TouchableOpacity>
            {formik.errors.CountrydropdownValue && formik.touched.CountrydropdownValue && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <Text style={styles.label}>{fields?.['STATE']?.fieldValue || 'State'}</Text>
            <TouchableOpacity style={[{ ...styles.input, ...styles.dropDownStyle }, !(permissions?.isEditableState) && styles.disableInput]}
                onPress={() => (permissions?.isEditableState) && handleDropdownChange(2)}>
                <Text style={{ color: colors.black }}>{formik?.values.StatedropdownValue}</Text>
                <IconButton icon={() => <MaterialIcons name={true ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{ margin: 0 }} color={colors.black} />}
                    style={{ marginHorizontal: 0 }} size={16} />
            </TouchableOpacity>
            {formik.errors.StatedropdownValue && formik.touched.StatedropdownValue && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <Text style={styles.label}>{fields?.['CITY']?.fieldValue || 'City'}</Text>
            <TouchableOpacity style={[{ ...styles.input, ...styles.dropDownStyle }, !(permissions?.isEditableCity) && styles.disableInput]}
                onPress={() => (permissions?.isEditableCity) && handleDropdownChange(3)}>
                <Text style={{ color: colors.black }}>{formik?.values.CitydropdownValue}</Text>
                <IconButton icon={() => <MaterialIcons name={true ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} size={25} style={{ margin: 0 }} color={colors.black} />}
                    style={{ marginHorizontal: 0 }} size={16} />
            </TouchableOpacity>
            {formik.errors.CitydropdownValue && formik.touched.CitydropdownValue && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <View style={styles.bottomRow}>
                <Button style={styles.bottonBtn} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.handleSubmit()} mode="contained" >
                    {t('update')}
                </Button>
                <Button style={{ ...styles.bottonBtn, backgroundColor: colors.black }} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.resetForm()} mode="contained" >
                    {t('clear')}
                </Button>
            </View>
            {/* <View style={styles.bottomRow}>
                <Button style={styles.bottonBtn} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => setOnSubmit({ action: 'submit' })} mode="contained" >
                    {t('update')}
                </Button>
                <Button style={{ ...styles.bottonBtn, backgroundColor: colors.black }} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => setOnSubmit({ action: 'cancel' })} mode="contained" >
                    {t('cancel')}
                </Button>
            </View> */}

            <StructureModal
                visibilityCheck={countryDropdownOpen}
                modalTitle={fields?.[renderObj?.label]?.fieldValue}
                onClose={onCLoseModal}
                onSearch={true}
                setKeyword={setSearchKeyword}
                RenderContent={() => (
                    renderObj?.arr?.length ?
                        <FlatList
                            data={searchKeyword == '' ? renderObj.arr : filteredArray}
                            renderItem={renderItem}
                            scrollEnabled={true}
                            keyExtractor={(item) => item.value}
                            contentContainerStyle={{}}
                        />
                        : (<Text style={{ fontSize: 15, padding: 20, alignSelf: 'center', color: colors.grey }}>{t('NO_DATA_TO_DISPLAY')}</Text>)
                )
                }
            />

            <View style={{ backgroundColor: 'aqua', zIndex: 5, }}>
                {/* <Text style={styles.label}>{fields?.['COUNTRY']?.fieldValue || 'Country'}</Text>
                <DropDownPicker
                    open={countryDropdownOpen}
                    value={activeCountry}
                    items={arrCountry}
                    placeholder={t('select')}
                    dropDownContainerStyle={{ maxHeight: 100 }}
                    placeholderStyle={{ color: colors.lightgrey }}
                    setOpen={setCountyDropdownOpen}
                    setValue={setActiveCountry}
                    setItems={setArrCountry}
                /> */}
                {/* <DropDownPicker
                    disable={(permissions?.isEditableCountry)}
                    style={[styles.input]}
                    // placeholderStyle={styles2.placeholderStyle}
                    // selectedTextStyle={styles2.selectedTextStyle}
                    // inputSearchStyle={styles2.inputSearchStyle}
                    // iconStyle={styles2.iconStyle}
                    data={countries}
                    search={true}
                    maxHeight={300}
                    labelField="countryName"  // Ensure you're using the correct label field
                    valueField="countryName"  // Make sure this matches the selected item's key
                    placeholder={'Select country'}
                    searchPlaceholder="Search..."
                    value={formik.values.CountrydropdownValue}  // This should be linked to formik value
                    onChange={item => {
                        setSelectedCountry(item);
                        console.log('selected country:', item);
                        formik.setFieldValue('CountrydropdownValue', item.countryName);
                        formik.setFieldValue('countryId', item.countryId);
                        setCities([]);
                        setStates([]);
                        GetStatesMethod(item.countryId);

                    }}
                    renderItem={(item) => (
                        <View style={styles2.optionContainer}>
                            <Text style={styles2.optionText}>{item.countryName}</Text>
                        </View>
                    )}
                /> */}
                {/*    {formik.touched.CountrydropdownValue && formik.errors.CountrydropdownValue && (
                    <Text style={styles.errorText}>{formik.errors.CountrydropdownValue}</Text>
                )} */}
            </View>
            {/*
                <View style={styles.inputContainer}>
                    <Text style={selectlanguage?.languageOrientation == 'RTL' ? styles.detailLabelAr : styles.label}>{selectlanguage?.languageOrientation === 'RTL' ? fields?.['STATE']?.fieldValue : 'State'}</Text>
                   
                    {formik.touched.StatedropdownValue && formik.errors.StatedropdownValue && (
                        <Text style={styles.errorText}>{formik.errors.StatedropdownValue}</Text>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <Text style={selectlanguage?.languageOrientation == 'RTL' ? styles.detailLabelAr : styles.label}>{selectlanguage?.languageOrientation === 'RTL' ? fields?.['CITY']?.fieldValue : 'City'}</Text>
                    <Dropdown
                        disable={permissions?.otpEditableCityId ? false : true}
                        style={[styles2.dropdown, { borderColor: isFocus ? 'blue' : '#f0f0f0' }, !permissions?.otpEditableCountryId && { backgroundColor: '#f0f0f0' },]}
                        placeholderStyle={styles2.placeholderStyle}
                        selectedTextStyle={styles2.selectedTextStyle}
                        inputSearchStyle={styles2.inputSearchStyle}
                        iconStyle={styles2.iconStyle}
                        data={Cities}
                        maxHeight={300}
                        search={true}
                        labelField="cityName"  // Ensure you're using the correct label field
                        valueField="cityName"  // Make sure this matches the selected item's key
                        placeholder={'Select City...'}
                        searchPlaceholder="Search..."
                        value={formik.values.CitydropdownValue}  // This should be linked to formik value
                        onChange={item => {
                            setSelectedCity(item);
                            formik.setFieldValue('CitydropdownValue', item.cityName);
                            formik.setFieldValue('cityId', item.cityId);
                        }}
                        renderItem={(item) => (
                            <View style={styles2.optionContainer}>
                                <Text style={styles2.optionText}>{item.cityName}</Text>
                            </View>
                        )}
                    />
                    {formik.touched.CitydropdownValue && formik.errors.CitydropdownValue && (
                        <Text style={styles.errorText}>{formik.errors.CitydropdownValue}</Text>
                    )}

                    <View>
                        <TouchableOpacity
                            style={[styles2.button, { backgroundColor: '#3B2E4A', marginVertical: 10 }]}
                            onPress={formik.handleSubmit}
                        // disabled = {
                        //     permissions?.otpEditableCityId === false &&
                        //     permissions?.otpEditableStateId === false &&
                        //     permissions?.isEditableName === false &&
                        //     permissions?.isEditableArabicName === false &&
                        //     permissions?.isEditableShortName === false &&
                        //     permissions?.isEditablePhone === false &&
                        //     permissions?.isEditableFax === false &&
                        //     permissions?.otpEditableAddress1 === false &&
                        //     permissions?.otpEditableShippingAddress1 === false &&
                        //     permissions?.otpEditableCountryId === false

                        // }
                        >
                            <Text style={styles2.buttonText}>
                                {selectlanguage?.languageOrientation === 'RTL' ? 'تحديث' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View> */}
        </View >
    );
});

const commonStyles = StyleSheet.create({});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        // backgroundColor: colors.primary,
    },
    label: {
        color: colors.black,
        fontSize: 16,
    },
    errorText: {
        color: colors.red,
        fontSize: 10,
    },
    disableInput: {
        backgroundColor: colors.lightgrey
    },
    dropDownStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        marginVertical: 5,
        borderColor: colors.lightgrey,
        color: colors.black,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 13,
    },
    singleItem: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: colors.white,
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
});

export default ProfileForm;
