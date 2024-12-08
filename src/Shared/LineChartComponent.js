import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import colors from "../Utils/colors";
import { LineChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

export default LineChartComponent = ({ title, data, dataCount, comparedValue, onClick, disableClick }) => {
    const screenWidth = Dimensions.get("window").width;
    const navigation = useNavigation();
    const { t } = useTranslation();
    const initializeData = {
        labels: ["May", "June", "july", "August",],
        datasets: [
            {
                data: [
                    0, 0, 0, 0,
                ]
            }
        ]
    };
    const chartConfig = {
        backgroundGradientFrom: colors.black,
        backgroundGradientFromOpacity: .5,
        backgroundGradientTo: colors.secondary,
        backgroundGradientToOpacity: 1,
        color: (opacity = 1) => `rgba(299, 255, 255, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
    };
    return (
        <View style={{ backgroundColor: colors.white, padding: 10, marginVertical: 5, marginHorizontal: 10, borderRadius: 6, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <Text style={{ color: colors.black, fontWeight: '500', fontSize: 15 }}>{title || ''}</Text>
                <Text style={{ color: colors.secondary, fontSize: 20, fontWeight: 'bold' }}>{dataCount || 0}</Text>
            </View>
            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => !disableClick && onClick()}>
                <LineChart
                    data={data || initializeData}
                    width={screenWidth * .90}
                    height={250}
                    verticalLabelRotation={30}
                    chartConfig={chartConfig}
                    bezier
                />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 5, padding: 10, alignItems: 'center' }}>
                <Text style={{ color: colors.secondary, fontSize: 15, fontWeight: 'bold' }}>{comparedValue || 0}% </Text>
                <Text style={{ color: colors.black, fontSize: 13 }}>{t('COMPARED_TO_LAST_MONTH')}</Text>
            </View>
        </View>
    );
}