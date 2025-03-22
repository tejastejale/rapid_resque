import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import loading from "../../assets/Animation.gif";
import tw from "twrnc";

const Loading = () => {
  const animatedValue = useRef(new Animated.Value(-500)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  return (
    <View style={tw`h-full w-full flex items-center justify-center`}>
      <Image source={loading} style={tw``} />
      <Animated.Text
        style={[
          tw`text-violet-600 italic font-semibold text-3xl`,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        Rapid Rescue
      </Animated.Text>
    </View>
  );
};

export default Loading;
