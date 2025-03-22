import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

const RadarPing = () => {
  const scale1 = useSharedValue(0);
  const opacity1 = useSharedValue(1);
  const scale2 = useSharedValue(0);
  const opacity2 = useSharedValue(1);
  const scale3 = useSharedValue(0);
  const opacity3 = useSharedValue(1);
  const scale4 = useSharedValue(0);
  const opacity4 = useSharedValue(1);

  React.useEffect(() => {
    scale1.value = withRepeat(
      withTiming(3, { duration: 3000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    opacity1.value = withRepeat(
      withTiming(0, { duration: 3000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    scale2.value = withRepeat(
      withTiming(3, { duration: 3500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    opacity2.value = withRepeat(
      withTiming(0, { duration: 3500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    scale3.value = withRepeat(
      withTiming(3, { duration: 4000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    opacity3.value = withRepeat(
      withTiming(0, { duration: 4000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    scale4.value = withRepeat(
      withTiming(3, { duration: 4500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    opacity4.value = withRepeat(
      withTiming(0, { duration: 4500, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));
  const animatedStyle4 = useAnimatedStyle(() => ({
    transform: [{ scale: scale4.value }],
    opacity: opacity4.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ping, animatedStyle1]} />
      <Animated.View style={[styles.ping, animatedStyle2]} />
      <Animated.View style={[styles.ping, animatedStyle3]} />
      <Animated.View style={[styles.ping, animatedStyle4]} />
      <View style={styles.centerDot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  ping: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#a684ff",
    position: "absolute",
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7f22fe",
  },
});

export default RadarPing;
