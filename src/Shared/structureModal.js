import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../Utils/colors';
import { Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setCartVisible } from '../redux/slices/customerSlice';
import { useEffect, useState } from 'react';
import { IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { setLoading } from '../redux/slices/authSlice';
import FastImage from 'react-native-fast-image';
import { Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export default StructureModal = ({ navigation, modalTitle, visibilityCheck, RenderContent, onClose, onSearch, setKeyword }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);
    const [showModal, setShowModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const { t } = useTranslation();
    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
        },
        modalContent: {
            marginVertical: 50,
            marginHorizontal: 10,
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 10,
            // width: '90%',
        },
        headerTitle: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.secondary,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            paddingVertical: 10,
        },
        modalTitle: {
            flex: 1,
            fontSize: 18,
            paddingHorizontal: 10,
            color: colors.white,
            textAlign: 'left',
            fontWeight: 'bold',

        },
        loader: {
            zIndex: 10,
            top: 0,
            left: 0, right: 0,
            bottom: 0,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: .7,
            backgroundColor: colors.primary
        }

    });
    useEffect(() => {
        setShowModal(visibilityCheck);
        setSearchKeyword('');
    }, [visibilityCheck]);

    useEffect(() => {
        if (onSearch) {
            setKeyword(searchKeyword);
        }
    }, [searchKeyword])

    const closeModal = () => {
        // dispatch(setCartVisible(false));
        setSearchKeyword('');
        onSearch && setKeyword('');
        onClose();
        setShowModal(false)
    }

    return (
        <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={closeModal}
        // Handle Android back button
        >
            {isLoading && <View style={styles.loader}>
                <FastImage
                    source={require('../assets/images/Ripple-1s-200px.gif')} // Local GIF
                    style={{ width: 80, height: 80, opacity: .9 }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {/* <ActivityIndicator size="large" /> */}
            </View>}
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.headerTitle}>
                        <Text style={styles.modalTitle}>{modalTitle || 'Open'}</Text>
                        <IconButton icon={() => <MaterialIcons name="close" size={23} color={colors.primary} />} size={15}
                            onPress={closeModal} />
                    </View>
                    {!!onSearch && <Searchbar
                        selectionColor={colors.secondary}
                        onIconPress={() => console.log(searchKeyword)}
                        icon={() => <MaterialIcons name="search" size={23} color={colors.secondary} />}
                        clearIcon={() => searchKeyword !== '' && (
                            <MaterialIcons name="close" size={23} color={colors.secondary} />
                        )}
                        style={{ backgroundColor: colors.white, borderRadius: 0 }}
                        placeholderTextColor={colors.grey}
                        color={colors.black}
                        placeholder={t('search')}
                        onChangeText={setSearchKeyword}
                        value={searchKeyword}

                    />}
                    <RenderContent />
                </View>
            </View>
        </Modal>
    );

};