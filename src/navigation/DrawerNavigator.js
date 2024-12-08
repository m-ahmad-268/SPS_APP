// /navigation/DrawerNavigator.js
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../components/CustomDrawerContent';
import HomeScreen from '../screens/HomeScreen';
import CustomHeader from '../Shared/header';
import { useSelector } from 'react-redux';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import colors from '../Utils/colors';
import ArrowUp from '../assets/icons/arrowUp.svg'
import React, { Suspense, useEffect, useState } from 'react';
import { setScreenFieldsData } from '../services/auth';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Dashboard from '../screens/Dashboard';
import EditInvoiceScreen from '../screens/Invoice/EditInvoiceScreen';
import AttachmentScreen from '../screens/Invoice/AttachmentScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// const Dashboard = React.lazy(() => import('../screens/Dashboard'));
const AllQuotationScreen = React.lazy(() => import('../screens/Quotation/AllQuotationScreen'));
const ProfileScreen = React.lazy(() => import('../screens/Profile/ProfileScreen'));
const QuotationFormScreen = React.lazy(() => import('../screens/Quotation/QuotationFormScreen'));
const AllOrderScreen = React.lazy(() => import('../screens/Order/AllOrderScreen'));
const OrderFormScreen = React.lazy(() => import('../screens/Order/OrderFormScreen'));
const AllInvoicesScreen = React.lazy(() => import('../screens/Invoice/AllInvoicesScreen'));
const CreateReturnScreen = React.lazy(() => import('../screens/Invoice/CreateReturnScreen'));
const CartScreen = React.lazy(() => import('../screens/CartScreen'));


const MainStack = ({ fields }) => {
    const { t } = useTranslation();
    return (
        <Suspense>
            <Stack.Navigator>
                <Stack.Screen name='dashboard' component={Dashboard}
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} headerTitle={fields?.['DASHBOARD']?.fieldValue || 'Dashboard'} />
                    })}
                />
                <Stack.Screen name='profile' component={ProfileScreen}
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} headerTitle={fields?.['PROFILE_INFORMATION']?.fieldValue || 'Dashboard'} />
                    })}
                />
                <Stack.Screen
                    name="AllQuotationScreen"
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} headerTitle={t('quotation')} />
                    })}
                >
                    {(props) => (
                        <AllQuotationScreen {...props} />
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="QuotationFormScreen"
                    options={{ headerShown: false }}
                    component={QuotationFormScreen}
                />
                <Stack.Screen
                    name="AllOrderScreen"
                    component={AllOrderScreen}
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} headerTitle={t('order')} />
                    })}
                />
                <Stack.Screen
                    name="OrderFormScreen"
                    options={{ headerShown: false }}
                    component={OrderFormScreen}
                />
                <Stack.Screen
                    name="AllInvoicesScreen"
                    component={AllInvoicesScreen}
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} headerTitle={t('invoices')} />
                    })}
                />
                <Stack.Screen
                    name="EditInvoiceScreen"
                    component={EditInvoiceScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AttachmentScreen"
                    component={AttachmentScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="CreateReturnScreen"
                    component={CreateReturnScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="CartScreen"
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} headerTitle={fields?.['CART']?.fieldValue || 'Cart'} />
                    })}
                >
                    {(props) => (
                        <CartScreen {...props} />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </Suspense>
    )
};

const DrawerNavigator = ({ navigation }) => {
    const { activeRouteName } = useSelector((state) => state.auth);
    const { language } = useSelector((state) => state.language);
    const [fields, setFields] = useState(null);
    const [mainHeaderTitle, setMainHeaderTitle] = useState('Quotation');



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
            initialRouteName='MainStack'
            drawerContent={(props) => <CustomDrawerContent {...{ ...props, fields: fields }} />}
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

            <Drawer.Screen name='MainStack' options={{
                headerShown: false,
                headerTitleAlign: 'center',
                headerStyle: {
                    height: 55,
                    backgroundColor: colors.secondary,

                },
                // headerTintColor: colors.white,
                // Text color
                headerTitleStyle: {
                    // backgroundColor:'red',
                    // fontWeight: 'bold',
                },
            }}
            >
                {() => (
                    <MainStack fields={fields} />
                )}
            </Drawer.Screen>
            {/* <Drawer.Screen name={fields?.['QUOTATION']?.fieldValue || 'Quotation'} options={{
                headerShown: false,
                headerStyle: {
                    height: 55,
                    backgroundColor: colors.secondary,

                },
                headerTitleAlign: 'center',
                headerTitleStyle: {
                },
            }}>
                {() => (
                    <QuotationStack />
                )}

            </Drawer.Screen> */}
            {/* <Drawer.Screen name={fields?.['ORDER']?.fieldValue || 'Order'} component={AllOrderScreen} options={{
                headerShown: true,
                headerStyle: {
                    height: 55,
                    backgroundColor: colors.secondary,
                },
                headerTitleAlign: 'center',
                headerTitleStyle: {
                },
            }} /> */}
            {/* <Drawer.Screen name={fields?.['INVOICES']?.fieldValue || 'Invoices'} component={AllInvoicesScreen} options={{
                headerShown: true,
                headerStyle: {
                    height: 55,
                    backgroundColor: colors.secondary,
                },
                headerTitleAlign: 'center',
                // headerTintColor: colors.white,
                // Text color
                headerTitleStyle: {
                    // backgroundColor:'red',
                    // fontWeight: 'bold',
                },
            }} /> */}
            {/* <Drawer.Screen name="SettingsScreen" component={SettingsScreen}
                options={({ navigation }) => ({
                    headerTintColor: colors.black,

                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ backgroundColor: 'red' }}>
                            <Text style={{ color: 'blue' }}>Open Drawer</Text>
                        </TouchableOpacity>
                    ),
                    headerShown: true,
                }
                )}
            /> */}
            {/*
            <Drawer.Screen name="HomeScreen" component={HomeScreen}
                options={({ navigation, headerTitle }) => ({
                    headerShown: true,
                    header: () => (
                        <CustomHeader navigation={navigation} headerTitle={'HomeScreen'} />
                    )
                })
                }

            /> */}
        </Drawer.Navigator >
    );
};

export default DrawerNavigator;