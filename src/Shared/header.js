import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../Utils/colors';
import { IconButton } from 'react-native-paper';
import { Badge } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setCartVisible } from '../redux/slices/customerSlice';

export default CustomHeader = ({ navigation, headerTitle }) => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.customer);
    const { userProfile } = useSelector(state => state.auth);
    const currentLanguage = useSelector((state) => state.language.language);
    const navigationState = navigation.getState();
    let activeRouteName = '';

    if (navigationState?.routes) {
        const nestedState = navigationState.routes.find(route => route.state)?.state;
        if (nestedState) {
            // Get the active route from the nested stack navigator
            const activeIndex = nestedState.index;
            activeRouteName = nestedState.routes[activeIndex].name;
        } else {
            // Fallback if there is no nested state
            activeRouteName = navigationState.routes[navigationState.index].name;
        }
    }
    const isActiveRoute = (routeName) => activeRouteName === routeName;
    const styles = StyleSheet.create({
        headerStyle: {
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 'bold',
            color: colors.white,
            marginLeft: 10,
        },
        haederRow: {
            height: 55,
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

    const getInitials = () => {
        const email = userProfile.email;
        if (!email) return '';
        return email.slice(0, 2).toUpperCase();
    };

    return (
        <View style={styles.haederRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {!isActiveRoute('dashboard') && <IconButton icon={() => <MaterialIcons name={currentLanguage == 'ar' ? 'arrow-forward' : 'arrow-back'} size={20} color={colors.white} />}
                    onPress={() => navigation.goBack()} size={10} />}
                <TouchableOpacity style={{ backgroundColor: colors.primary, height: 40, width: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 30 }} onPress={() => navigation.toggleDrawer()}>
                    <Text style={{ color: colors.black, fontWeight: 'bold' }}>{getInitials()} </Text>
                </TouchableOpacity>
                {/* <IconButton icon={() => <MaterialIcons name="menu" size={23} color={colors.white} />} size={15}
                style={{}} onPress={() => navigation.toggleDrawer()} /> */}
                <Text style={styles.headerStyle}>{headerTitle}</Text>
            </View>
            <View style={{ flexDirection: 'row', }}>
                {!!cartItems.length &&
                    <>
                        <IconButton icon={() => <MaterialIcons name="shopping-cart" size={24} color={colors.white} />}
                            onPress={() => dispatch(setCartVisible(true))} size={15} />
                        {/* onPress={() => navigation.navigate('CartScreen')} size={7} /> */}
                        <Text style={{ color: colors.white, fontWeight: 'bold', position: 'relative', fontSize: 10, left: -9 }}>{cartItems.length}</Text>
                    </>}
                {/* <Badge size={16} style={{ backgroundColor: colors.white, color: 'black', fontWeight: 'bold', position: 'relative', bottom: 22, left: -12 }}>20</Badge> */}
                {/* <IconButton icon={() => <MaterialIcons name="favorite" size={23} style={{ margin: 0 }} color={colors.white} />} size={15}
                    onPress={() => console.log("Pressed Favorite btn")} /> */}
            </View>
            {/* <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Text style={styles.headerRight}>{'logout'}</Text>
            </TouchableOpacity> */}
        </View>
    );

};