import React from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function TransactionChart() {
  return (
    <View className="bg-[#F3F3F3] p-3 rounded-2xl mt-4">
      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              data: [200, 450, 300, 500, 380, 600],
            },
          ],
        }}
        width={screenWidth * 0.75}
        height={160}
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: "#F3F3F3",
          backgroundGradientTo: "#F3F3F3",
          color: () => "#3B82F6",
          strokeWidth: 3,
        }}
        bezier
        withDots
        withInnerLines={false}
        withOuterLines={false}
      />
    </View>
  );
}
