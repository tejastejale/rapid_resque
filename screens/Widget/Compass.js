import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";

const Compass = ({ onPress }) => {
  const [heading, setHeading] = useState(0);
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current; // Scale animation

  useEffect(() => {
    checkMagnetometer();
  }, []);

  const checkMagnetometer = async () => {
    const magnetometerAvailable = await Magnetometer.isAvailableAsync();
    if (magnetometerAvailable) {
      startMagnetometer();
    } else {
      startGPSCompass();
    }
  };

  const startMagnetometer = () => {
    Magnetometer.addListener((data) => {
      let angle = Math.atan2(data.y, data.x) * (160 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
      animateCompass(angle);
    });

    return () => Magnetometer.removeAllListeners();
  };

  const startGPSCompass = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 600,
        distanceInterval: 2,
      },
      (location) => {
        const newHeading = Math.random() * 360; // Simulating movement
        setHeading(newHeading);
        animateCompass(newHeading);
      }
    );
  };

  const animateCompass = (newHeading) => {
    Animated.spring(rotateValue, {
      toValue: newHeading,
      tension: 5,
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8, // Scale up on press
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Scale back to normal
      useNativeDriver: false,
    }).start();
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotateValue.interpolate({
          inputRange: [0, 360],
          outputRange: ["0deg", "360deg"],
        }),
      },
      { scale: scaleValue },
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.compassContainer, rotateStyle]}>
          <Image
            source={{
              uri: "https://media.geeksforgeeks.org/wp-content/uploads/20240122153821/compass.png",
            }}
            style={styles.compassImage}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  compassContainer: {
    width: "fit-content",
    height: "fit-content",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    padding: 5,
  },
  compassImage: { width: 80, height: 80 },
});

export default Compass;
