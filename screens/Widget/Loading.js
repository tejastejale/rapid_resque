import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import loading from "../../assets/Animation.gif";
import tw from "twrnc";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

const Loading = () => {
  const animatedValue = useRef(new Animated.Value(-500)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={tw`h-full w-full flex items-center justify-center`}>
      <Image source={loading} style={tw``} />

      {/* For the animated gradient text */}
      <MaskedView
        style={{ height: 60, width: 300 }}
        maskElement={
          <View style={tw`flex items-center justify-center h-full`}>
            <Animated.Text
              style={[
                tw`text-black font-semibold text-3xl italic`,
                {
                  transform: [{ translateX: animatedValue }],
                },
              ]}
            >
              Rapid Rescue
            </Animated.Text>
          </View>
        }
      >
        <LinearGradient
          colors={["red", "#a684ff"]}
          start={{ x: 1, y: 4 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </MaskedView>
    </View>
  );
};

export default Loading;
