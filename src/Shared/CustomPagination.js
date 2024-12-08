import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FontAwesome from 'react-native-vector-icons/MaterialIcons';

const CustomPagination = ({ page, numberOfPages, onPageChange, itemsPerPage, setItemsPerPage }) => {
    return (
        <View style={styles.pagination}>
            <TouchableOpacity
                onPress={() => onPageChange(Math.max(page - 1, 0))}
                disabled={page === 0}
            >
                <FontAwesome name="chevron-left" size={24} color={page === 0 ? 'gray' : 'black'} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
                {page + 1} of {numberOfPages}
            </Text>

            <TouchableOpacity
                onPress={() => onPageChange(Math.min(page + 1, numberOfPages - 1))}
                disabled={page === numberOfPages - 1}
            >
                <FontAwesome name="chevron-right" size={24} color={page === numberOfPages - 1 ? 'gray' : 'black'} />
            </TouchableOpacity>

            {/* Items per Page Selector */}
            <Picker
                selectedValue={itemsPerPage}
                style={styles.picker}
                onValueChange={(itemValue) => setItemsPerPage(itemValue)}
            >
                <Picker.Item label="5" value={5} />
                <Picker.Item label="10" value={10} />
                <Picker.Item label="20" value={20} />
                <Picker.Item label="All" value={numberOfPages * itemsPerPage} />
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    pageText: {
        fontSize: 16,
        marginHorizontal: 10,
    },
    picker: {
        height: 50,
        width: 100,
    },
});

export default CustomPagination;
