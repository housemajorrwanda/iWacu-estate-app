import { height, width } from "@/components/global";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export function AnimatedTabIcon({
  Icon,
  focused,
}: {
  Icon: any;
  focused: boolean;
}) {
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

const styles = StyleSheet.create({
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
