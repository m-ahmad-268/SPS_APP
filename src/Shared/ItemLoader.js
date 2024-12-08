import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import colors from "../Utils/colors";

export default ItemLoader = ({ customStyle }) => {
    return (
        <View style={{ ...customStyle, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
            <ActivityIndicator color={colors.secondary} size="small" />
        </View>
    );
}