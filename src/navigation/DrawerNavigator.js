// /navigation/DrawerNavigator.js
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../components/CustomDrawerContent';
import Dashboard from '../screens/Dashboard';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomHeader from '../Shared/header';
import { useSelector } from 'react-redux';
import { Text, TouchableOpacity, View } from 'react-native';
import colors from '../Utils/colors';
import ArrowUp from '../assets/icons/arrowUp.svg'
import AllQuotationScreen from '../screens/Quotation/AllQuotationScreen';
import { useEffect, useState } from 'react';
import { setScreenFieldsData } from '../services/auth';

const Drawer = createDrawerNavigator();
const DrawerNavigator = ({ navigation }) => {
    const { activeRouteName } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.language);
    const [fields, setFields] = useState(null);


    const setScreenFieldsDataApi = async () => {
        try {
            const response = await setScreenFieldsData(fields, "M-SPS", "S-SIDEBAR_MENU", { 'langid': language == 'ar' ? 2 : 1 });
            setFields(response);
        } catch (error) {
            setFields(true);
            dispatch(resetLoading());
            console.error('Server error:', error);
        }
    };


    useEffect(() => {
        console.log('---------------------------------------Drawertriggerd---------------------------------------', language);
        setScreenFieldsDataApi();
    }, [language])

    return (
        <Drawer.Navigator
            key={0}
            initialRouteName={fields?.['DASHBOARD']?.fieldValue || 'Dashboard'}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerActiveTintColor: colors.secondary,
                drawerInactiveTintColor: colors.white,
                drawerStyle: {
                    backgroundColor: colors.black, // Drawer background color
                    width: 250,
                    marginTop: 55,
                    opacity: 0.9,
                },
                headerStyle: {
                    backgroundColor: colors.secondary,
                    // Header background color
                },
                headerTintColor: colors.white,
                overlayColor: 'rgba(0, 0, 0, 0.3)'
                // overlayColor: 'transparent',
                // Header text color
            }}

        // screenOptions={{ drawerPosition: language?.languageOrientation === 'RTL' ? 'right' : 'left' }}
        >
            <Drawer.Screen name={fields?.['DASHBOARD']?.fieldValue || 'Dashboard'} component={Dashboard} options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.secondary,
                },
                // headerTintColor: colors.white,
                // Text color
                headerTitleStyle: {
                    // backgroundColor:'red',
                    // fontWeight: 'bold',
                },
            }} />
            <Drawer.Screen name={fields?.['QUOTATION']?.fieldValue || 'Quotation'} component={AllQuotationScreen} options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.secondary,
                },
                // headerTintColor: colors.white,
                // Text color
                headerTitleStyle: {
                    // backgroundColor:'red',
                    // fontWeight: 'bold',
                },
            }} />
            <Drawer.Screen name={fields?.['ORDER']?.fieldValue || 'Order'} component={AllQuotationScreen} options={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.secondary,
                },
                // headerTintColor: colors.white,
                // Text color
                headerTitleStyle: {
                    // backgroundColor:'red',
                    // fontWeight: 'bold',
                },
            }} />
            {/* <Drawer.Screen name="SettingsScreen" component={SettingsScreen}
                options={({ navigation }) => ({
                    headerTintColor: colors.black,

                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingLeft: 16 }}>
                            <Text style={{ color: 'blue' }}>Open Drawer</Text>
                        </TouchableOpacity>
                    ),
                    headerShown: true,
                }
                )}
            />
            <Drawer.Screen name="HomeScreen" component={HomeScreen}
                options={({ navigation, headerTitle }) => ({
                    headerShown: true,
                    header: () => (
                        <CustomHeader navigation={navigation} headerTitle={'HomeScreen'} />
                    )
                })
                }

            /> */}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;