import { Image, Text, View, useWindowDimensions } from "react-native";
import MonthlyChart from "./ProfileBarChart";

export default function ProfileCard({ profileData }: any) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  console.log(profileData);

  /* ---------------- HEADER ---------------- */
  const ProfileHeader = () => (
    <View className="flex-row items-center">
      <Image
        source={{
          uri: profileData?.profile_image || "https://i.pravatar.cc/150?img=12",
        }}
        style={{
          width: isSmall ? 60 : 80,
          height: isSmall ? 60 : 80,
          borderRadius: 100,
        }}
      />
      <View className="ml-4 flex-1">
        <Text
          numberOfLines={1}
          className="font-bold text-black"
          style={{ fontSize: isSmall ? 14 : 18 }}
        >
          {profileData?.full_name || "Update Profile"}
        </Text>
        <Text
          className="text-gray-500 capitalize"
          style={{ fontSize: isSmall ? 14 : 18 }}
        >
          {profileData?.account_type}
        </Text>
      </View>
    </View>
  );

  /* ---------------- STATS ---------------- */
  const StatsRow = () => (
    <View className="flex-row mt-4 justify-between">
      <Stat number={profileData?.transactions} label="Transactions" />
      <Stat number={profileData?.total_booked || 0} label="Clients" />
    </View>
  );

  const Stat = ({ number, label }: any) => (
    <View>
      <Text className="font-bold" style={{ fontSize: isSmall ? 18 : 22 }}>
        {number}
      </Text>
      <Text className="text-gray-500">{label}</Text>
    </View>
  );

  /* ---------------- CHART ---------------- */
  const MonthlyCharts = () => {
    const data = [40, 70, 190, 65, 50, 35];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const colors = [
      "#EF4444",
      "#22C55E",
      "#F59E0B",
      "#52525B",
      "#67E8F9",
      "#3B82F6",
    ];

    const max = Math.max(...data);
    // console.log(max);
    const CHART_HEIGHT = isSmall ? 80 : 110;

    return (
      <View
        style={{
          height: CHART_HEIGHT * 1.3,
        }}
        className="bg-[#F5F3F1] p-4 rounded-3xl flex-1"
      >
        <View
          className="flex-row items-end justify-between"
          style={{ height: CHART_HEIGHT }}
        >
          {data.map((value, i) => {
            const normalizedHeight = (value / max) * CHART_HEIGHT * 0.7;
            return (
              <View key={i} className="items-center flex-1">
                <View
                  style={{
                    width: isSmall ? 2 : 7,
                    height: normalizedHeight,
                    backgroundColor: "#3B82F6",
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                />
                <Text className="text-gray-500 text-xs">{months[i]}</Text>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: colors[i],
                    marginTop: 4,
                    borderRadius: 3,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  /* ---------------- FAVORITE LOCATIONS ---------------- */
  const FavoriteLocations = () => (
    <View className="bg-[#F5F3F1] p-4 rounded-3xl flex-1 mt-3">
      <Text className="text-gray-600  text-xs font-semibold mb-2">
        Most favorite locations
      </Text>
      <View className="flex flex-row flex-wrap gap-2">
        {[profileData?.favorite_locations]?.map((loc: any, i: number) => (
          <View key={i} className="flex flex-row px-2 mx-2 items-center">
            {/* <DotIcon /> */}
            <Text className="text-gray-700 text-xs">{loc}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  /* ---------------- LAYOUT ---------------- */
  return (
    <View className="bg-white rounded-[40px] p-5 border border-gray-200">
      <ProfileHeader />
      <StatsRow />

      {/* Responsive layout switch */}
      <View className={`flex flex-col gap-3 my-2 ${isSmall ? "" : "flex-row"}`}>
        <MonthlyChart monthlyStats={profileData?.monthly_stats || []} />
        <FavoriteLocations />
      </View>
    </View>
  );
}
