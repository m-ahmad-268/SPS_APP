import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../Utils/colors';

export default CustomHeader = ({ navigation, headerTitle }) => {
    const styles = StyleSheet.create({
        headerStyle: {
            textAlign: 'center',
            fontSize: 20,
            color: colors.white
        },
        haederRow: {
            height: 50,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.secondary,
            paddingHorizontal: 10,
            flexDirection: 'row',
        },
        headerRight: {
            fontSize: 15,
            color: colors.white,
        },
        toggleBtn: {
            backgroundColor: 'red',
            width: 20,
            height: 20
        }

    });

    return (
        <View style={styles.haederRow}>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => navigation.toggleDrawer()}>
                {/* <Text style={{ backgroundColor: 'red', fontSize: 15 }}>{'logout'}</Text> */}
            </TouchableOpacity>
            <Text style={styles.headerStyle}>{headerTitle}</Text>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Text style={styles.headerRight}>{'logout'}</Text>
            </TouchableOpacity>
        </View>
    );

};