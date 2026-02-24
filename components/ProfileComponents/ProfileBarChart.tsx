import React, { useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
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
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });

  const [yAxisMax, setYAxisMax] = useState(0);

  useEffect(() => {
    if (monthlyStats && monthlyStats.length > 0) {
      const values = monthlyStats.map((item) => item.value);
      const maxValue = Math.max(...values);

      setYAxisMax(maxValue + 2); // add some space above the max value
      setChartData({
        labels: monthlyStats.map((item) => item.month),
        datasets: [
          {
            data: values,
          },
        ],
      });
    }
  }, [monthlyStats]);

  return (
    <View className="bg-[#F5F3F1] p-2 rounded-xl">
      <LineChart
        data={chartData}
        width={screenWidth / 1.2} // fit nicely on screen
        height={Dimensions.get("window").height * 0.18}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1} // ensures even spacing
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
        style={{
          borderRadius: 10,
        }}
        segments={yAxisMax} // number of horizontal lines
        // formatYLabel={(y) => `${Math.round(Number(y))}`} // clean y-axis labels
      />
    </View>
  );
};

export default MonthlyChart;
