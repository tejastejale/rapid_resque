import { Button } from "galio-framework";
import React, { useEffect, useRef } from "react";
import { Text, Image, Animated, View, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function MainScreen({ navigation }) {
  const animatedValue = useRef(new Animated.Value(-500)).current;
  const animatedValue2 = useRef(new Animated.Value(300)).current;
  const carouselData = [
    {
      id: 1,
      title: "Emergency Support",
      description: "Quick and reliable support during emergencies.",
      image: require("../../assets/imgs/Login/driver.png"),
    },
    {
      id: 2,
      title: "Rapid Assistance",
      description: "Connecting you with nearby helpers.",
      image: require("../../assets/imgs/Login/tp.png"),
    },
    {
      id: 3,
      title: "Safe & Secure",
      description: "Prioritizing your safety in every step.",
      image: require("../../assets/imgs/Login/user.png"),
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(animatedValue2, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }, 400);

    setTimeout(() => {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, [animatedValue, animatedValue2, navigation]);

  // Calculate dynamic font size
  const getResponsiveFontSize = (baseSize) => {
    return Math.round((baseSize * width) / 375); // Assuming 375 is the base screen width (iPhone X)
  };

  return (
    <View style={tw`h-full w-full bg-white`}>
      {/* Carousel Section */}
      <View style={tw`h-[40%] w-full`}>
        <Carousel
          loop
          width={width}
          autoPlay={true}
          autoPlayInterval={3000}
          data={carouselData}
          renderItem={({ item }) => (
            <View style={tw`h-full w-full items-center justify-center`}>
              <Image
                source={item.image}
                style={tw`h-full w-full rounded-lg`}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </View>

      {/* Bottom Content Section */}
      <LinearGradient
        colors={["#e5e7eb", "#FFFFFF"]}
        style={tw`w-full h-[60%] rounded-t-[50px] p-10 flex flex-col justify-between elevation-20`}
      >
        <View>
          <View style={tw`flex flex-row gap-2`}>
            <Text
              style={[
                tw`font-semibold italic mb-2`,
                { fontSize: getResponsiveFontSize(24) },
              ]}
            >
              Welcome to
            </Text>
            <Animated.Text
              style={[
                tw`text-violet-600 italic font-semibold`,
                {
                  fontSize: getResponsiveFontSize(24),
                  transform: [{ translateX: animatedValue }],
                },
              ]}
            >
              Rapid Rescue
            </Animated.Text>
          </View>
          <Text
            style={[
              tw`font-normal italic`,
              { fontSize: getResponsiveFontSize(16) },
            ]}
          >
            We provide solutions to fulfill your emergency needs with just one
            click !!!
          </Text>
        </View>
        <View>
          <View>
            <Button
              style={tw`w-full bg-violet-600 rounded-2xl elevation-10 mx-0`}
              onPress={() => navigation.navigate("UserLogin")}
            >
              Register as User
            </Button>
            <Button
              style={tw`w-full bg-violet-600 rounded-2xl elevation-10 mx-0 mt-2`}
              onPress={() => navigation.navigate("DriverLogin")}
            >
              Register as Driver
            </Button>
          </View>
          <View style={tw`w-full mt-4`}>
            <View style={tw`flex flex-row justify-center items-center`}>
              <View style={tw`w-1/2 bg-gray-300 h-[2px]`} />
              <Text style={[tw`px-2`, { fontSize: getResponsiveFontSize(14) }]}>
                or
              </Text>
              <View style={tw`w-1/2 bg-gray-300 h-[2px]`} />
            </View>
            <View>
              <Animated.View
                style={[
                  {
                    transform: [{ translateY: animatedValue2 }],
                  },
                ]}
              >
                <Button
                  style={tw`w-full bg-violet-600 rounded-2xl elevation-10 mx-0`}
                  onPress={() => navigation.navigate("Login")}
                >
                  Make a Login
                </Button>
              </Animated.View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
