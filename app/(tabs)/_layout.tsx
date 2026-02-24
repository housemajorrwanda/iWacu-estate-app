import { height, width } from "@/components/global";
import { Tabs } from "expo-router";
import {
  Home,
  Luggage,
  MapPin,
  MessageCircle,
  User,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
/* ---------------- Animated Tab Icon Component ---------------- */

function AnimatedTabIcon({ Icon, focused }: { Icon: any; focused: boolean }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: focused ? -height * 0.012 : 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        focused && styles.activeTab,
        { transform: [{ translateY }] },
      ]}
    >
      <Icon
        width={width * 0.065}
        height={width * 0.065}
        stroke={focused ? "#00b894" : "#666"}
      />
    </Animated.View>
  );
}

/* ---------------- Main Tab Layout ---------------- */

export default function TabLayout() {
  const tabs = [
    { name: "luggage", icon: Luggage },
    { name: "nearBy", icon: MapPin },
    { name: "home", icon: Home },
    { name: "chats", icon: MessageCircle },
    { name: "profile", icon: User },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {tabs.map((tab, i) => {
        const Icon = tab.icon;

        return (
          <Tabs.Screen
            key={i}
            name={tab.name}
            options={{
              tabBarIcon: ({ focused }) => (
                <AnimatedTabIcon Icon={Icon} focused={focused} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: height * 0.025,
    left: width * 0.04,
    right: width * 0.04,
    height: height * 0.085,
    borderRadius: 40,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 12,
  },

  iconWrapper: {
    padding: width * 0.03,
    borderRadius: 50,
    backgroundColor: "#fff",
  },

  activeTab: {
    backgroundColor: "#000",
    shadowColor: "#00b894",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
