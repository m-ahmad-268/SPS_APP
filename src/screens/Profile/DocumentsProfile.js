import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, TouchableOpacity, I18nManager, ScrollView, Alert } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// import MapView, { Marker } from 'react-native-maps';
import colors from '../../Utils/colors';
import { useDispatch, useSelector } from 'react-redux';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { getCityListByStateId, getCountryList, getStateListByCountryId } from '../../services/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Button, IconButton } from 'react-native-paper';
import { saveOrUpdate, getAllDocumentByCustomerId, downloadById, getCustomerDocumentTypes } from '../../services/drawerService';
import { ShowToastMessage } from '../../Shared/ShowToastMessage'; import CustomFlaglist from '../../Shared/CustomFlaglist';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';
import getEnvVars from '../../Config/env';
import FileViewer from 'react-native-file-viewer';
// import StructureModal from '../../Shared/structureModal';
// import MapModal from '../../Shared/MapModal';
// import { Searchbar } from 'react-native-paper';


const DocumentsProfile = ({ fields, permissions, activeCustomer }) => {
    const { financialReportApiBaseUrl } = getEnvVars();
    const [fileName, setFileName] = useState(null);
    const [fileData, setFileData] = useState(null);
    const isuserToken = useSelector((state) => state.auth.userToken);
    const [isModalVisible, setModalVisible] = useState(false);
    const [documentArray, setDocumentArray] = useState([]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);


    const { t } = useTranslation();
    const [filePath, setFilePath] = useState('');
    const [arrTypes, setArrTypes] = useState([]);
    const [arrCity, setArrCity] = useState([]);
    const [isFocus, setIsFocus] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const selectlanguage = useSelector((state) => state.language.language);
    const { userProfile, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const getHeader = async () => {
        const lngId = selectlanguage == 'ar' ? '2' : '1';
        return {
            langid: lngId, 'content-type': 'application/json',
            userid: JSON.stringify(userProfile?.userId), session: userProfile?.session, tenantid: userProfile?.tenantid
        };
    }

    //validation schema:
    const DocumentValidationSchema = Yup.object({
        // Phone: Yup.string().max(14, t("PHONE_MUST_BE_14")) // Using max() for a maximum length
        customerDocumentDescription: Yup.string().required(t("SHIPPING_ADDRESS_IS_REQUIRED")),
        typeDropdownValue: Yup.string().required(t("TYPE_IS_REQUIRED")),
        fileName: Yup.string().required(t("fileName_IS_REQUIRED")),
    });

    const formik = useFormik({
        initialValues: {
            customerDocumentDescription: '',
            typeDropdownValue: '',
            documentTypeId: null,
            notes: '',
            fileName: '',
        },
        validationSchema: DocumentValidationSchema,
        enableReinitialize: true,
        onSubmit: values => {
            submitData();

        },
    });

    const pickFile = async () => {
        try {
            // Pick a single file
            const res = await DocumentPicker.pick({
                type: [
                    DocumentPicker.types.pdf,
                    DocumentPicker.types.doc,
                    DocumentPicker.types.docx,
                    DocumentPicker.types.xlsx,
                ],
            });

            const fileSizeInMB = res[0].size / (1048576);

            if (fileSizeInMB > 10) {
                ShowToastMessage({ message: t('MAXIMUM_ALLOWED_FILE_OR_IMAGE_SIZE') + ': 10Mb', message2: t('error'), type: "error" });
                return;
            }

            // Extract the file details
            const { name, uri, type } = res[0];
            formik.setFieldValue('fileName', name);

            // Convert file to binary
            const fileBinary = {
                uri: uri,
                type: type,
                name: name,
            };
            setFileData(fileBinary);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('User cancelled file picker');
            } else {
                console.error('File picker error:', err);
            }
        }
    };

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

    const getAllDocument = async () => {
        try {
            dispatch(setLoading())
            const headers = await getHeader();
            const reqBody = {
                "customerId": userProfile?.customerNo,
                "searchKeyword": '',
                "sortOn": "",
                "sortBy": "ASC",
                "pageNumber": 0,
                "pageSize": 1000,
                "fromSps": true
            }
            const response = await getAllDocumentByCustomerId({ ...reqBody }, headers)
            if (response && (response.code == 200 || response.code == 201) && response?.result && response.result?.records?.length) {
                console.log("response =======> ", response.result.records.length);
                const arr = response.result.records.map((x, index) => {
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
                                rowTitle: fields?.['ID']?.fieldValue || 'Id',
                                rowValue: x?.id,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['ATTACHMENT_DESCRIPTION']?.fieldValue || 'Attachment Description',
                                rowValue: x?.documentAttachmenDesc,
                            },
                            {
                                show: true,
                                rowTitle: fields?.['EXPIRY_DATE']?.fieldValue || 'Expiry Date',
                                rowValue: x?.attachmentExpiryDateTime,
                            },
                            // {
                            //     show: true,
                            //     rowTitle: fields?.['DOWNLOAD']?.fieldValue || 'Download',
                            //     rowValue: x?.documentAttachmentName,
                            // },
                            // {
                            //     show: true,
                            //     rowTitle: fields?.['ADDRESS']?.fieldValue || 'Address',
                            //     rowValue: x?.shippingAddress1,
                            // },
                            // {
                            //     show: true,
                            //     rowTitle: fields?.['FAX']?.fieldValue || 'Fax',
                            //     rowValue: x?.fax,
                            // },
                            // {
                            //     show: x?.latitude && true,
                            //     rowTitle: fields?.['LAT']?.fieldValue || 'Latitude',
                            //     rowValue: x?.latitude,
                            // },
                            // {
                            //     show: x?.longitude && true,
                            //     rowTitle: fields?.['LONG']?.fieldValue || 'Longitude',
                            //     rowValue: x?.longitude,
                            // },
                        ],
                        btnArray: [
                            {
                                title: fields?.['DOWNLOAD']?.fieldValue || 'Download',
                                type: 'download',
                            },
                        ]
                    }
                })
                setDocumentArray([...arr]);
            }
            dispatch(resetLoading());
        } catch (error) {
            console.error("Error fetching data:", error);
            dispatch(resetLoading());
        }
    }

    const CustomerDocumentTypes = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const resData = await getCustomerDocumentTypes({}, headers);
            if (resData.code == 201 && resData?.result && resData.result?.records && resData.result.records.length > 0) {

                const arr = resData?.result.records.map(x => {
                    return {
                        label: x?.documentAttachmenDesc,
                        value: x?.id
                    }
                })
                setArrTypes([...arr]);
                dispatch(resetLoading());

                // const obj = arr.find(x => x.value == formik.values?.countryId)
                // console.log('countryId------------------------', obj);
                // if (obj) {
                //     formik.setFieldValue('customerDocumentDescription', obj.label);
                // }
            }

        } catch (error) {
            console.log('Error in GEtting CustomerDocumentTypes Detail', error);
            dispatch(resetLoading());
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
        if (activeCustomer) {
            formik.resetForm();
            setFileData(null);
            getAllDocument();
            CustomerDocumentTypes();
        }

    }, [activeCustomer]);

    const downloadRecord = async (recordId) => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const reqBody = { id: recordId?.id };

            const downloadDest = `${RNFetchBlob.fs.dirs.DownloadDir}/${recordId?.documentAttachmentName}`;
            let response = await RNFetchBlob.config({
                fileCache: true,
                // appendExt: 'pdf',
                path: downloadDest,
            })
                .fetch('POST', `${financialReportApiBaseUrl}/customerDocument/downloadById`, headers, JSON.stringify(reqBody))
                .then((res) => {
                    console.log('File downloaded to:', res.path());
                    setFilePath(res.path());
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
            console.error("Error saving downloadRecord address:", error);
            dispatch(resetLoading());
        }

    };
    const submitData = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const DtoCustomerDocument = {
                attachmentExpiryDateTime: date.toLocaleDateString(),
                customerId: userProfile?.customerNo,
                attachmentType: formik.values.documentTypeId,
                listDtoCustomerDocumentLangs: [],
                documentAttachmenDesc: formik.values.customerDocumentDescription,
                id: null,
                documentAmount: null,
                note: formik.values.notes,
            }

            const formData = new FormData();
            formData.append('file', fileData); // Add file to the form data
            formData.append('DtoCustomerDocument', JSON.stringify(DtoCustomerDocument));
            const response = await saveOrUpdate(formData, { ...headers, 'Content-Type': 'multipart/form-data', });

            if (response && response.code === 201) {
                formik.resetForm();
                getAllDocument();
                ShowToastMessage({ message: response?.btiMessage.message, message2: t('success'), type: "success" });
            } else {
                ShowToastMessage({ message: response?.btiMessage.message, message2: t('error'), type: "error" });
                dispatch(resetLoading());
            }
        } catch (error) {
            console.error("Error saving Dcouemts:", error);
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
        if (event.action == 'download' && event?.data?.id) {
            console.log('vee', event.data.id);
            downloadRecord(event.data);

        }

    };

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{}}>
                <Text style={styles.label}>{fields?.['EXPIRY_DATE']?.fieldValue || 'Expiry Date'}</Text>
                <TextInput
                    style={{ ...styles.input, color: colors.black }}
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
            <Text style={styles.label}>{fields?.['ATTACHMENT_DESCRIPTION']?.fieldValue || 'Attachment Description'}</Text>
            <TextInput style={styles.input}
                placeholderTextColor={colors.lightgrey}
                value={formik.values.customerDocumentDescription}
                onChangeText={formik.handleChange('customerDocumentDescription')}
                onBlur={formik.handleBlur('customerDocumentDescription')}

            />
            {formik.errors.customerDocumentDescription && formik.touched.customerDocumentDescription && (<Text style={styles.errorText}>{t('requiredValid')}</Text>)}
            <Text style={styles.label}>{fields?.['TYPE']?.fieldValue || 'Type'}</Text>
            <Dropdown
                style={[{ ...styles.input, ...styles.dropdown }]}
                placeholderStyle={{}}
                selectedTextStyle={{ color: colors.black }}
                inputSearchStyle={{}}
                iconStyle={{}}
                iconColor={colors.black}
                data={arrTypes}
                maxHeight={300}
                search={true}
                labelField="label"
                valueField="label"
                placeholder={t("")}
                searchPlaceholder={t("search")}
                value={formik.values.typeDropdownValue}
                onChange={item => {
                    formik.setFieldValue('typeDropdownValue', item.label);
                    formik.setFieldValue('documentTypeId', item.value);
                }}
            />
            {formik.touched.typeDropdownValue && formik.errors.typeDropdownValue && (
                <Text style={styles.errorText}>{t('requiredValid')}</Text>
            )}

            <Text style={styles.label}>{fields?.['NOTES']?.fieldValue || 'Notes'}</Text>
            <TextInput style={[styles.input,]}
                placeholderTextColor={colors.lightgrey}
                value={formik.values.notes}
                onChangeText={formik.handleChange('notes')}
                onBlur={formik.handleBlur('notes')}

            />
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { fontSize: 13 }]}>{t('MaximumAllowedSize')}: 10Mb</Text>
                    <Text style={[styles.label, { fontSize: 13 }]}>{t('allowedFileType')}: XLSX, PDF, DOC, DOCX, etc...</Text>
                    <Text style={[styles.label, { fontSize: 13 }]}>{formik.values.fileName}</Text>
                </View>
                {/* <TextInput style={[styles.input, { flex: 1 }]}
                    placeholderTextColor={colors.lightgrey}
                    value={formik.values.longitude}
                    onChangeText={formik.handleChange('longitude')}
                    onBlur={formik.handleBlur('longitude')}
                    keyboardType="phone-pad"
                /> */}
                <IconButton icon={() => <MaterialIcons name="upload-file" size={20} color={colors.white} />} size={25}
                    style={{ backgroundColor: colors.secondary, marginHorizontal: 10, borderRadius: 5 }} onPress={() => pickFile()} />
            </View>
            <View style={styles.bottomRow}>
                <Button style={[styles.bottonBtn, !formik.values.fileName && { opacity: .6 }]} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.handleSubmit()} mode="contained" >
                    {t('save')}
                </Button>
                <Button style={{ ...styles.bottonBtn, backgroundColor: colors.black }} labelStyle={[true ? { color: colors.white } : { color: colors.grey }]} onPress={() => formik.resetForm()} mode="contained" >
                    {t('clear')}
                </Button>
            </View>
            <CustomFlaglist listData={documentArray} getId={getClickedId}
                buttonTitle={{
                    show: true,
                    nestedScrollCheck: false,
                }} />
            {/* <StructureModal
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
            /> */}
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

export default DocumentsProfile;