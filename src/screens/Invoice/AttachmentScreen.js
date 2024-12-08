// /screens/SettingsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Button, IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../../Utils/colors';
import DocumentPicker from 'react-native-document-picker';
import { resetLoading, setLoading } from '../../redux/slices/authSlice';
import { ShowToastMessage } from '../../Shared/ShowToastMessage';
import RNFetchBlob from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import { uploadSalesInvoiceAttachment, getSalesInvoiceAttachment, deleteSalesInvoiceAttachment } from '../../services/drawerService';
import CustomFlaglist from '../../Shared/CustomFlaglist';
import getEnvVars from '../../Config/env';

const AttachmentScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { id, fields } = route.params || '';
    const [formBody, setFormBody] = useState({ documentAttachmenDesc: '', fileName: '' });
    const [allData, setAllData] = useState([]);
    const [fileData, setFileData] = useState(null);
    // const { fields } = route.params || '';
    const { isLoading, token, error, isAuthenticated, userProfile } = useSelector((state) => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);
    const { imsModuleApiDirectBaseUrl } = getEnvVars();

    useEffect(() => {
        console.log('-------------------------AttachmentScreen Entrances-----------------', currentLanguage);
        getInvoiceAttachments();

    }, []);

    const getHeader = async () => {
        const lngId = currentLanguage == 'ar' ? '2' : '1';
        return {
            langid: lngId, 'content-type': 'application/json',
            userid: String(userProfile?.userId), session: userProfile?.session, tenantid: userProfile?.tenantid
        };
    };

    const pickFile = async () => {
        try {
            // Pick a single file
            const res = await DocumentPicker.pick({
                type: [
                    DocumentPicker.types.pdf,
                    // DocumentPicker.types.doc,
                    // DocumentPicker.types.docx,
                    // DocumentPicker.types.xlsx,
                ],
            });

            const fileSizeInMB = res[0].size / (1048576);

            if (fileSizeInMB > 10) {
                ShowToastMessage({ message: t('MAXIMUM_ALLOWED_FILE_OR_IMAGE_SIZE') + ': 10Mb', message2: t('error'), type: "error" });
                return;
            }

            // Extract the file details
            const { name, uri, type } = res[0];
            setFormBody(prev => ({
                ...prev,
                fileName: name,
            }));

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
    const assignArray = (transactionList) => {
        try {
            const arr = transactionList.map((x, index) => {
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
                            rowTitle: fields?.['ID']?.fieldValue || 'Id',
                            rowValue: x?.id,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['DOCUMENT_NAME']?.fieldValue || 'Document Name',
                            rowValue: x?.documentAttachmentName,
                        },
                        {
                            show: true,
                            rowTitle: fields?.['DOCUMENT_DESCRIPTION']?.fieldValue || 'Document Description',
                            rowValue: x?.documentAttachmenDesc,
                        },
                    ],
                    btnArray: [
                        {
                            title: fields?.['DOWNLOAD']?.fieldValue || 'Download',
                            type: 'download',
                        },
                        {
                            title: t('delete'),
                            type: 'delete',
                        },

                    ]
                }
            })
            if (arr.length)
                setAllData([...arr]);
            dispatch(resetLoading());
        } catch (error) {
            console.log('assignArray', error);
            dispatch(resetLoading());
        }
    };

    const getInvoiceAttachments = async () => {
        try {
            setAllData([]);
            dispatch(setLoading());
            const headers = await getHeader();
            const response = await getSalesInvoiceAttachment({ invoiceId: id }, headers);
            if (response && response?.code == 200 && response?.result && response?.result?.length) {
                const list = response.result;
                assignArray(list);
            } else {
                dispatch(resetLoading());
            }
        } catch (error) {
            dispatch(resetLoading());
            console.error('getCustomerOrderById error:', error);
        }
    };

    const getClickId = async (event) => {
        if (event?.action == 'download') {
            downloadRecord(event);

        }
        else if (event?.action == 'delete') {
            deleteInvoiceAttachment(event);
        }
    };
    const downloadRecord = async (event) => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const body = {
                invoiceId: id,
                documentAttachmentName: event.data.documentAttachmentName,
            }

            const downloadDest = `${RNFetchBlob.fs.dirs.DownloadDir}/attachment_ID(${id}).pdf`;
            let response = await RNFetchBlob.config({
                fileCache: true,
                // appendExt: 'pdf',
                path: downloadDest,
            })
                .fetch('POST', `${imsModuleApiDirectBaseUrl}/salesTransactionEntry/downloadSalesInvoiceAttachment`, headers, JSON.stringify(body))
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

    const deleteInvoiceAttachment = async (event) => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const body = {
                invoiceId: id,
                documentAttachmentName: event.data.documentAttachmentName,
            }
            const response = await deleteSalesInvoiceAttachment(body, headers);
            if (response && response?.code == 200) {
                getInvoiceAttachments();
            } else {
                dispatch(resetLoading());
            }
            const msg = response?.code == 200 ? 'success' : 'error';
            ShowToastMessage({ message: response?.btiMessage.message, message2: t(msg), type: msg });

        } catch (error) {
            console.log('deleteInvoiceAttachment', error);
            dispatch(resetLoading());

        }
    };

    const submitData = async () => {
        try {
            dispatch(setLoading());
            const headers = await getHeader();
            const body = {
                invoiceId: id,
                documentAttachmentName: formBody?.fileName,
                documentAttachmenDesc: formBody?.documentAttachmenDesc,
                documents: [
                    {
                        invoiceId: id,
                        documentAttachmentName: formBody?.fileName,
                        documentAttachmenDesc: formBody?.documentAttachmenDesc,
                    }
                ]
            }
            const formData = new FormData();
            formData.append('files', fileData); // Add file to the form data
            formData.append('body', JSON.stringify(body));
            const response = await uploadSalesInvoiceAttachment(formData, { ...headers, 'Content-Type': 'multipart/form-data', });
            if (response && response.code === 201) {
                ShowToastMessage({ message: response?.btiMessage.message, message2: t('success'), type: "success" });
                getInvoiceAttachments();
                setFormBody({ fileName: '', documentAttachmenDesc: '' })
            } else {
                ShowToastMessage({ message: response?.btiMessage.message, message2: t('error'), type: "error" });
                dispatch(resetLoading());
            }
        } catch (error) {
            console.error("Error saving Dcouemts:", error);
            dispatch(resetLoading());
        }
    };


    return (
        <>
            <CustomHeader navigation={navigation} headerTitle={fields?.['ATTACHMENT']?.fieldValue || 'Attachment'} />
            <View style={styles.container}>
                <Text style={styles.label}>{fields?.['DOCUMENT_DESCRIPTION']?.fieldValue || 'Document Description'}</Text>
                <TextInput style={styles.input}
                    placeholderTextColor={colors.lightgrey}
                    value={formBody.documentAttachmenDesc}
                    onChangeText={(text) =>
                        setFormBody((prev) => ({
                            ...prev, // Keep the existing state
                            documentAttachmenDesc: text, // Update the specific property
                        }))
                    }
                />
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { fontSize: 13 }]}>{t('MaximumAllowedSize')}: 10Mb</Text>
                        <Text style={[styles.label, { fontSize: 13 }]}>{t('allowedFileType')}: XLSX, PDF, DOC, DOCX, etc...</Text>
                        <Text style={[styles.label, { fontSize: 13 }]}>{formBody.fileName}</Text>
                    </View>
                    <IconButton icon={() => <MaterialIcons name="upload-file" size={20} color={colors.white} />} size={25}
                        style={{ backgroundColor: colors.secondary, marginHorizontal: 10, borderRadius: 5 }} onPress={() => pickFile()} />
                </View>
                <View style={{ gap: 5, flexDirection: 'row', paddingTop: 10, }}>
                    <Button onPress={() => formBody.fileName && submitData()}
                        style={[styles.btn, { backgroundColor: colors.success }, !formBody.fileName && { opacity: .7 }]} mode="contained" textColor={colors.white} >
                        {t('save')}
                    </Button>
                    <Button onPress={() => navigation.goBack()}
                        style={[styles.btn, { backgroundColor: colors.danger }]} mode="contained" textColor={colors.white} >
                        {t('clear')}
                    </Button>
                </View>
                {/* <ScrollView showsVerticalScrollIndicator={false}>
                </ScrollView> */}
                {<CustomFlaglist listData={allData} getId={getClickId}
                    buttonTitle={{
                        show: true,
                        nestedScrollCheck: true,
                    }} />}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: colors.primary,
    },
    label: {
        textAlign: 'left',
        color: colors.black,
        fontSize: 16,
    },
    input: {
        marginVertical: 5,
        borderColor: colors.grey,
        color: colors.black,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 13,
    },
    btn: {
        flex: 1,
        borderRadius: 5,
    },
});

export default AttachmentScreen;
