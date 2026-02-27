import { TAB_BAR_HEIGHT } from "@/components/global";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width } = Dimensions.get("window");

// Dynamic scaling
const scale = (size: number) => (width / 375) * size;

const demoNotifications = [
  {
    id: "1",
    type: "booking",
    title: "New Booking Request",
    message: "Someone requested to book your house in Kacyiru.",
    time: "2 min ago",
    is_read: false,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Successful",
    message: "Your booking payment of 100 RWF was successful.",
    time: "10 min ago",
    is_read: false,
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "You received a new message from Emmanuel.",
    time: "1 hour ago",
    is_read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Account Verified",
    message: "Your landlord account has been verified successfully.",
    time: "Yesterday",
    is_read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications] = useState(demoNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Ionicons name="home" size={scale(20)} color="#4C6EF5" />;
      case "payment":
        return (
          <MaterialIcons name="payments" size={scale(20)} color="#12B886" />
        );
      case "message":
        return (
          <Ionicons
            name="chatbubble-ellipses"
            size={scale(20)}
            color="#F59F00"
          />
        );
      default:
        return (
          <Ionicons name="notifications" size={scale(20)} color="#868E96" />
        );
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: item.is_read ? "#FFFFFF" : "#F0F4FF" },
      ]}
      activeOpacity={0.85}
    >
      <View style={styles.iconContainer}>{getIcon(item.type)}</View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>

        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.screenTitle}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: scale(20),
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: scale(16),
    paddingBottom: TAB_BAR_HEIGHT,
  },
  screenTitle: {
    fontSize: scale(22),
    fontWeight: "700",
    marginVertical: scale(12),
  },
  card: {
    flexDirection: "row",
    padding: scale(14),
    borderRadius: scale(14),
    marginBottom: scale(12),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: scale(6),
    elevation: 3,
  },
  iconContainer: {
    width: scale(45),
    height: scale(45),
    borderRadius: scale(12),
    backgroundColor: "#EDF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: scale(15),
    fontWeight: "600",
    flex: 1,
  },
  message: {
    fontSize: scale(13),
    color: "#495057",
    marginTop: scale(4),
  },
  time: {
    fontSize: scale(11),
    color: "#868E96",
    marginTop: scale(6),
  },
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#4C6EF5",
    marginLeft: scale(8),
  },
});
