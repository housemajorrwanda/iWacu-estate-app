import React, { useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

interface MonthlyStats {
  month: string;
  value: number;
}

interface Props {
  monthlyStats: MonthlyStats[];
}

const MonthlyChart: React.FC<Props> = ({ monthlyStats }) => {
  // 🔐 Safe fallback
  if (!monthlyStats || monthlyStats.length === 0) {
    return (
      <View className="bg-[#F5F3F1] p-4 rounded-xl items-center justify-center">
        <Text className="text-gray-500 text-sm">No monthly data</Text>
      </View>
    );
  }

  const values = monthlyStats.map((item) =>
    Number.isFinite(item.value) ? item.value : 0,
  );

  const maxValue = Math.max(...values);

  // 🎯 Create clean rounded max (next multiple of 10 or 50)
  const niceMax = useMemo(() => {
    if (maxValue <= 10) return 10;
    if (maxValue <= 50) return Math.ceil(maxValue / 10) * 10;
    if (maxValue <= 200) return Math.ceil(maxValue / 20) * 20;
    return Math.ceil(maxValue / 50) * 50;
  }, [maxValue]);

  // 🎯 Clean interval (4 lines)
  const interval = niceMax / 4;

  const chartData = {
    labels: monthlyStats.map((item) => item.month),
    datasets: [{ data: values }],
  };

  return (
    <View className="bg-[#F5F3F1] p-3 rounded-xl">
      <LineChart
        data={chartData}
        width={screenWidth / 1.2}
        height={Dimensions.get("window").height * 0.2}
        fromZero
        segments={4} // ✅ fixed safe number
        yAxisInterval={1}
        chartConfig={{
          backgroundGradientFrom: "#F5F3F1",
          backgroundGradientTo: "#F5F3F1",
          decimalPlaces: 0, // ✅ removes decimals
          color: () => "#3B82F6",
          labelColor: () => "#6B7280",
          strokeWidth: 3,
        }}
        bezier
        withDots
        withInnerLines
        withOuterLines={false}
        formatYLabel={(y) => `${Math.round(Number(y))}`} // ✅ clean labels
        style={{
          borderRadius: 12,
        }}
      />
    </View>
  );
};

export default MonthlyChart;
