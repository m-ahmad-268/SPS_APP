// /navigation/DrawerNavigator.js
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../screens/Dashboard';
import HomeScreen from '../screens/HomeScreen';
import CustomerDetails from '../screens/CustomerDetails';
import CustomDrawerContent from '../components/CustomDrawerContent';


// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator initialRouteName="HomeScreen">
            <Stack.Screen
                name="Dashboard"
                component={Dashboard}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ headerShown: true }}
            />
        </Stack.Navigator>
    );
};
// const SettingsStack = () => {
//     return (
//         <Stack.Navigator>
//             <Stack.Screen
//                 name="Settings"
//                 component={Settings}
//                 options={{
//                     header: () =>

// ,
//                 }}
//             />
//         </Stack.Navigator>
//     );
// };
// const Navigation: React.FC = () => {
//     return (

//         <Drawer.Navigator>
//             <Drawer.Screen name="Home" component={HomeStack} />
//             <Drawer.Screen name="Settings" component={SettingsStack} />
//         </Drawer.Navigator>

//     );
// };

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            key={1}
            initialRouteName="Dashboard"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions='right'
        // screenOptions={{ drawerPosition: language?.languageOrientation === 'RTL' ? 'right' : 'left' }}
        >
            <Drawer.Screen name="Dashboard" component={Dashboard} options={{ headerShown: true }}>
                {/* {() => (
                    <HomeStack />
                )} */}
            </Drawer.Screen>
            <Drawer.Screen name="HomeStack" options={{ headerShown: true }}>
                {() => (
                    <HomeStack />
                )}

            </Drawer.Screen>

            <Drawer.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: true }}>
                {/* {() => (
                    <HomeStack />
                )} */}
            </Drawer.Screen>
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;