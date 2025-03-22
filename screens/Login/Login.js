import { Button } from "galio-framework";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Image,
  Animated,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import ArInput from "../../components/Input";
import { makeLogin } from "../API/actions/login";
import { carouselData } from "../../constants/constantData";
import { Toast, AlertNotificationRoot } from "react-native-alert-notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // For custom eye icon
import ArButton from "../../components/Button";
import * as Linking from "expo-linking";
const { width } = Dimensions.get("window");

export default function Login({ navigation }) {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
  const animatedValue = useRef(new Animated.Value(-500)).current;
  const animatedValue2 = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(animatedValue2, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, [animatedValue2]);

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, [animatedValue]);

  useEffect(() => {
    const backAction = async () => {
      navigation.navigate("MainScreen");
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener on unmount
  }, []);

  const isValid = () => !(formData.password && formData.phone);

  const showToasts = (type, msg) => {
    Toast.show({
      type: type, // 'success' or 'error'
      title: type === "SUCCESS" ? "Success!" : "Error",
      textBody: msg,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    await AsyncStorage.clear();
    try {
      const body = {
        phone_number: `+91${formData.phone}`,
        password: formData.password,
      };
      const res = await makeLogin(body);
      if (res.code === 200) {
        showToasts("success", res.message);
        navigation.navigate("Home");
      } else {
        showToasts("DANGER", res.data.errors[0] || "Something went wrong!");
      }
    } catch (error) {
      showToasts("DANGER", "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
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
          style={tw` w-full h-[60%] rounded-t-[50px] p-10 flex flex-col justify-between elevation-20`}
        >
          <View>
            <ArInput
              style={tw`border p-2 rounded-lg`}
              placeholder="Phone *"
              keyboardType="numeric"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <View style={tw`relative`}>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Password *"
                secureTextEntry={!passwordVisible} // Toggle password visibility
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)} // Toggle visibility on press
                style={tw`absolute right-4 top-4.5 transform -translate-y-1/2`}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <View style={tw`w-full`}>
              <Animated.View
                style={{
                  transform: [{ translateY: animatedValue2 }],
                }}
              >
                <Button
                  disabled={isValid() || loading} // Disable if loading or form is invalid
                  style={tw`w-full bg-violet-600 rounded-2xl elevation-10 mx-0 ${
                    isValid() || loading ? "opacity-50" : ""
                  }`}
                  onPress={handleLogin}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" /> // Show loader
                  ) : (
                    "Make a Login"
                  )}
                </Button>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </AlertNotificationRoot>
  );
}
