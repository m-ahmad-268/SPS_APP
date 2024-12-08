import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import colors from '../Utils/colors';
import ItemLoader from './ItemLoader';

const CustomFlaglist = ({ listData, showBtn, getId, buttonTitle }) => {
    const { t } = useTranslation();

    // const [list, setList] = useState([]);

    useEffect(() => {
        // console.log('list', listData);
    }, [listData])

    const getElementColor = (item) => {
        const selectedColor = {
            DRAFT: colors.blue,
            SUBMITTED: colors.black,
            PENDING: colors.textDark,
            RETURN_REQUEST_SUBMITTED: colors.textDark,
            EXPIRED: colors.danger,
            REJECTED: colors.danger,
            PENDING_FOR_APPROVAL: colors.aqua,
            APPROVED: colors.success,
            ACCEPTED: colors.success,
            DELIVERED: colors.success,
            CANCEL: colors.danger,
        };

        return { backgroundColor: selectedColor[item] || colors.secondary }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.container} onPress={() => getId({ grid: item })}>
                {item?.showHeader && <View style={{ justifyContent: 'space-between' }}>
                    <Text style={{ ...styles.text, fontWeight: 'bold' }}>{item.headerTitile}: {item.headerTitleValue}</Text>
                    <Text style={{ ...styles.text, fontWeight: 'bold' }}>{item.headerDesc}: {item.headerDescValue}</Text>
                </View>}
                <View style={styles.card}>
                    {/* <Text style={styles.orderText}> {item.cardHeader}: {item.orderRefNo}</Text> */}

                    {(item.rows.length ? true : false) && item.rows.map((x, index) => (
                        x.show && <View key={`${item.key}${index}`}
                            style={{ flexDirection: 'row', padding: 0, paddingHorizontal: 7 }}>
                            <Text style={styles.text}>{x.rowTitle}</Text>
                            <Text style={{ ...styles.text, fontWeight: 'bold', }}>{x.rowValue}</Text>
                        </View>
                    ))}

                    {buttonTitle?.show && item?.btnArray && item?.btnArray?.length && item?.btnArray.map((x, index) => (
                        < TouchableOpacity key={`${x.data?.id}hello${index}`} style={[styles.button, getElementColor(x?.title), x.disable && { opacity: .6 }]} onPress={() => !(x.disable) && getId({ action: x.type, data: item })}>
                            {/* <Text style={styles.buttonText}>{x.title}</Text> */}
                            {x?.title == 'PENDING' ? <ItemLoader
                                customStyle={{}} /> : <Text style={styles.buttonText}>{t(x?.title)}</Text>}
                        </TouchableOpacity>
                    ))
                    }
                </View >
            </TouchableOpacity >
        );
    };

    return (
        (listData.length ? true : false) ?
            <FlatList
                data={listData}
                renderItem={renderItem}
                scrollEnabled={buttonTitle.nestedScrollCheck}
                keyExtractor={(item) => item.key}
                contentContainerStyle={{ paddingVertical: 20 }}
            />
            : <Text style={{ flex: 1, fontSize: 15, color: 'black', textAlign: 'center', padding: 20 }}>{t('NO_DATA_TO_DISPLAY')}</Text>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        // paddingHorizontal: 10,
        // backgroundColor:'red',
        // justifyContent: 'center',
        // alignItems: 'center',
        // marginTop: 20,
    },
    card: {
        display: 'flex',
        borderColor: colors.lightgrey,
        borderRadius: 5,
        borderWidth: .5,
        elevation: 2,
        backgroundColor: colors.white,
        // flex: 1,
        // flexDirection: 'row',
        // width: '90%',
        // height: 250,
        // shadowColor: '#000',
        // shadowOpacity: 0.1,
        // shadowRadius: 10,
        // shadowOffset: { width: 0, height: 5 },
        // elevation: 5,
        // borderRadius: 10,
        // borderWidth: 0.5,
        marginVertical: 5,
        marginHorizontal: 10,
        padding: 10,
        // overflow: 'hidden',

    },
    orderText: {
        fontSize: 17,
        padding: 10,
        fontWeight: 'bold',
        color: '#B5944B'
    },
    text: {
        color: 'black',
        fontSize: 14,
        letterSpacing: .1,
        flex: 1,
        textAlign: 'left'
        // width: 200,
    },
    button: {
        padding: 3,
        borderRadius: 5,
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        // textAlign: 'center',
    },
});

export default CustomFlaglist;
