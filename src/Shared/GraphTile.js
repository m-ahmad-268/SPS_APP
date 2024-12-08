import { Text, TouchableOpacity, View } from "react-native";
import colors from "../Utils/colors";
import { IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default GraphTile = ({ tileStyle, title, data, dataCount, icon }) => {
    return (
        <View style={{ ...tileStyle, backgroundColor: colors.white, flex: 1, padding: 10, borderRadius: 10, }}>
            <Text style={{ color: colors.black, fontWeight: '500', fontSize: 14 }}>{title || ''}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.secondary, fontSize: 20, fontWeight: 'bold' }}>{dataCount || 0}</Text>
                {!!icon && <IconButton icon={() => <MaterialIcons name={icon} size={25} style={{}} color={colors.secondary} />}
                    onPress={() => console.log("Pressed Favorite btn")} />}
            </View>
        </View>
    );
}