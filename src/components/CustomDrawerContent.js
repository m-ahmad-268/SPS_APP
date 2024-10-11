// /components/DrawerContent.js
import React, { useEffect } from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import { checkSession, logout } from '../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';

const CustomDrawerContent = (props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        console.log('helloCustomDrawer-------------------');

    }, [])


    // console.log(JSON.stringify(props));


    const handleLogout = () => {
    };

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            {isAuthenticated && (
                <DrawerItem label={t('logout')} onPress={handleLogout} />
            )}
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
