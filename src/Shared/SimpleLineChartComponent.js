import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import colors from "../Utils/colors";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { LineChart, Grid } from 'react-native-svg-charts';
import { Circle, G, Text as SVGText } from 'react-native-svg';

export default SimpleLineChartComponent = ({ title, data, dataCount, comparedValue, onClick, disableClick }) => {
    const screenWidth = Dimensions.get("window").width;
    const navigation = useNavigation();

    const { t } = useTranslation();
    const labels = ["May", "June", "july", "August",];
    const dataset = [0, 0, 0, 0,];
    const Decorator = ({ x, y, data }) => {
        return data.map((value, index) => (
            <G key={index}>
                <Circle
                    cx={x(index)}
                    cy={y(value)}
                    r={4}
                    stroke={colors.secondary}
                    fill={colors.secondary}
                />
                <SVGText
                    x={x(index)}
                    y={y(value) - 10}
                    fontSize="10"
                    fill={colors.black}
                    alignmentBaseline="middle"
                    textAnchor="middle"
                >
                    {value}
                </SVGText>
            </G>
        ));
    };


    return (
        <TouchableOpacity
            onPress={() => !disableClick && onClick()}
            style={{ backgroundColor: colors.white, borderRadius: 5, padding: 10, marginHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <Text style={{ color: colors.black, fontWeight: '500', fontSize: 15 }}>{title || ''}</Text>
                <Text style={{ color: colors.secondary, fontSize: 20, fontWeight: 'bold' }}>{dataCount || 0}</Text>
            </View>
            <LineChart
                style={{
                    height: 150, width: (screenWidth - 60),
                    backgroundColor: colors.lightgrey,
                }}
                data={data?.dataset || dataset}
                svg={{ stroke: colors.secondary, colors: 'red' }}
                contentInset={{ top: 30, bottom: 20, left: 10, right: 10 }}
            >
                <Grid />
                <Decorator />
            </LineChart>
            <View style={{ flexDirection: 'row', height: 20, justifyContent: 'space-between', width: (screenWidth - 50) }}>
                {!!(data?.label && data?.label?.length) && data.label.map((label, index) => (
                    <Text key={index} style={{ fontSize: 6 }}>
                        {label}
                    </Text>
                ))}
            </View>
            <View style={{ flexDirection: 'row', paddingTop: 10, gap: 5, alignItems: 'center' }}>
                <Text style={{ color: colors.secondary, fontSize: 15, fontWeight: 'bold' }}>{comparedValue || 0}% </Text>
                <Text style={{ color: colors.black, fontSize: 13 }}>{t('COMPARED_TO_LAST_MONTH')}</Text>
            </View>
        </TouchableOpacity>
    );
};