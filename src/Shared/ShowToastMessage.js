import Toast from "react-native-toast-message";

export const ShowToastMessage = (props) => {
    Toast.show({
        type: props?.type || 'success', // 'error', 'info' can also be used
        text1: props?.message || '',
        text2: props?.message2 || '',
        visibilityTime: 2000,
    });
};