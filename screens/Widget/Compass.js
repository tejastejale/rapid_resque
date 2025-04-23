import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { Magnetometer } from "expo-sensors";
import compass from "../../assets/imgs/compass.png";

const Compass = ({ onPress }) => {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [hasSensor, setHasSensor] = useState(false);

  useEffect(() => {
    checkMagnetometer();
    return () => {
      Magnetometer.removeAllListeners(); // Clean up listener on unmount
    };
  }, []);

  const checkMagnetometer = async () => {
    const isAvailable = await Magnetometer.isAvailableAsync();
    setHasSensor(isAvailable);
    if (isAvailable) {
      startMagnetometer();
    }
  };

  const startMagnetometer = () => {
    Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      // Offset by 90 degrees to point north correctly
      const correctedAngle = angle - 90;
      animateCompass(-correctedAngle);
    });
  };

  const animateCompass = (heading) => {
    Animated.timing(rotateValue, {
      toValue: heading,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotateValue.interpolate({
          inputRange: [-360, 0, 360],
          outputRange: ["-360deg", "0deg", "360deg"],
        }),
      },
      { scale: scaleValue },
    ],
  };

  return hasSensor ? (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.compassContainer, rotateStyle]}>
          <Image source={compass} style={styles.compassImage} />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  compassContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 60,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  compassImage: {
    width: 50,
    height: 50,
    borderRadius: 60,
  },
});

export default Compass;
