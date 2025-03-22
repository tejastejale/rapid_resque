import { Button } from "galio-framework";
import React, { useState, useEffect } from "react";
import {
  Text,
  Image,
  Animated,
  View,
  Dimensions,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import tw from "twrnc";
import ArInput from "../../components/Input";
import { LinearGradient } from "expo-linear-gradient";
import { userRegister } from "../API/actions/register";
import { carouselData } from "../../constants/constantData";
import {
  Toast,
  AlertNotificationRoot,
  ALERT_TYPE,
} from "react-native-alert-notification"; // Import alert notification module
import ArButton from "../../components/Button";

const { width } = Dimensions.get("window");

export default function UserLogin({ navigation }) {
  const [InputData, setInputData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    firstNameError: "",
    lastNameError: "",
    phoneError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
    isValid: false,
  });

  const [isLoading, setIsLoading] = useState(false); // State for loading

  const animatedValue = new Animated.Value(-500);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const handleChange = (name, value) => {
    let error = "";

    // Validate based on the input field
    switch (name) {
      case "first_name":
        if (value.trim().length === 0) {
          error = "First name is required";
        }
        break;

      case "last_name":
        if (value.trim().length === 0) {
          error = "Last name is required";
        }
        break;

      case "phone":
        if (value.length !== 10 || !/^\d+$/.test(value)) {
          error = "Enter a valid Phone Number";
        }
        break;

      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Enter a valid email address";
        }
        break;

      case "password":
        if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        }
        break;

      case "confirm_password":
        if (value !== InputData.password) {
          error = "Passwords do not match";
        }
        break;

      default:
        break;
    }

    // Update state with the value and the specific error
    setInputData((prev) => ({
      ...prev,
      [name]: value,
      [`${name}Error`]: error,
      isValid: validateAllFields({
        ...prev,
        [name]: value,
        [`${name}Error`]: error,
      }),
    }));
  };

  const validateAllFields = (data) => {
    return (
      data.first_name.trim().length > 0 &&
      data.last_name.trim().length > 0 &&
      data.phone.length === 10 &&
      /^\d+$/.test(data.phone) &&
      /\S+@\S+\.\S+/.test(data.email) &&
      data.password.length >= 6 &&
      data.confirm_password === data.password
    );
  };

  const btnDisable = () => !InputData.isValid || isLoading;

  const showToasts = (type, msg) => {
    // Using react-native-alert-notification to display custom notifications
    if (type === "success") {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success!",
        textBody: msg,
        backgroundColor: "#34C759", // Green background for success
        textColor: "#ffffff", // White text color
        duration: 4000, // Display for 4 seconds
      });
    } else {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error!",
        textBody: msg,
        backgroundColor: "#FF3B30", // Red background for error
        textColor: "#ffffff", // White text color
        duration: 4000, // Display for 4 seconds
      });
    }
  };

  const handleLogin = async () => {
    setIsLoading(true); // Start loading

    const body = {
      phone_number: "+91" + InputData.phone,
      email: InputData.email,
      password: InputData.password,
      confirm_password: InputData.confirm_password,
      first_name: InputData.first_name,
      last_name: InputData.last_name,
    };
    try {
      const res = await userRegister(body);
      if (res?.code === 201) {
        handleClear();
        showToasts("success", "Verification mail has been sent!");
      } else {
        showToasts("error", showError(res));
      }
    } catch (error) {
      showToasts("error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const showError = (res) => {
    const response = res?.data;
    if (response?.errors?.[0]) return response.errors[0];
    if (response?.error) return response.error;
    return "Something went wrong!";
  };

  const handleClear = () => {
    setInputData({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
      firstNameError: "",
      lastNameError: "",
      phoneError: "",
      emailError: "",
      passwordError: "",
      confirmPasswordError: "",
      isValid: false,
    });
  };

  return (
    <AlertNotificationRoot>
      <View style={tw`h-full w-full bg-white`}>
        <View style={tw`h-[20%] w-full`}>
          {/* Carousel Section */}
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

        <LinearGradient
          colors={["#e5e7eb", "#FFFFFF"]}
          style={tw`flex flex-col h-[80%] justify-evenly bg-gray-200 w-full rounded-t-[50px] p-10 elevation-20`}
        >
          <View style={tw`flex `}>
            <View style={tw`flex flex-row gap-2`}>
              <Text style={tw`font-semibold italic text-2xl mb-2`}>
                Welcome to
              </Text>
              <Animated.Text
                style={[
                  tw`text-violet-600 text-2xl italic font-semibold`,
                  {
                    transform: [{ translateX: animatedValue }],
                  },
                ]}
              >
                Rapid Rescue
              </Animated.Text>
            </View>
            <Text style={tw`font-normal italic text-md`}>
              Do note your password for login!
            </Text>
          </View>
          <View>
            <ArInput
              onChangeText={(e) => handleChange("first_name", e)}
              placeholder="First Name *"
              value={InputData.first_name}
            />
            {InputData.firstNameError && (
              <Text style={tw`text-red-500 italic text-sm mb-2`}>
                {InputData.firstNameError}
              </Text>
            )}

            <ArInput
              onChangeText={(e) => handleChange("last_name", e)}
              placeholder="Last Name *"
              value={InputData.last_name}
            />
            {InputData.lastNameError && (
              <Text style={tw`text-red-500 italic text-sm mb-2`}>
                {InputData.lastNameError}
              </Text>
            )}

            <ArInput
              maxLength={10}
              keyboardType="numeric"
              onChangeText={(e) => handleChange("phone", e)}
              placeholder="Phone Number *"
              value={InputData.phone}
            />
            {InputData.phoneError && (
              <Text style={tw`text-red-500 italic text-sm mb-2`}>
                {InputData.phoneError}
              </Text>
            )}

            <ArInput
              onChangeText={(e) => handleChange("email", e)}
              placeholder="Email *"
              value={InputData.email}
            />
            {InputData.emailError && (
              <Text style={tw`text-red-500 italic text-sm mb-2`}>
                {InputData.emailError}
              </Text>
            )}

            <ArInput
              onChangeText={(e) => handleChange("password", e)}
              placeholder="Password *"
              secureTextEntry
              value={InputData.password}
            />
            {InputData.passwordError && (
              <Text style={tw`text-red-500 italic text-sm mb-2`}>
                {InputData.passwordError}
              </Text>
            )}

            <ArInput
              onChangeText={(e) => handleChange("confirm_password", e)}
              placeholder="Confirm Password *"
              secureTextEntry
              value={InputData.confirm_password}
            />
            {InputData.confirmPasswordError && (
              <Text style={tw`text-red-500 italic text-sm mb-2`}>
                {InputData.confirmPasswordError}
              </Text>
            )}
          </View>

          <View style={tw`w-full`}>
            <Button
              disabled={btnDisable()}
              onPress={handleLogin}
              style={tw`w-full m-0 mt-2 bg-violet-600 rounded-2xl elevation-10 ${
                !InputData.isValid || isLoading ? "opacity-50" : ""
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                "Continue"
              )}
            </Button>
          </View>
        </LinearGradient>
      </View>
    </AlertNotificationRoot>
  );
}
