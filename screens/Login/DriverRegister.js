import React, { useRef, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Button } from "galio-framework";
import tw from "twrnc";
import ArInput from "../../components/Input";
import * as ImagePicker from "expo-image-picker";
import { Icon } from "galio-framework";
import { LinearGradient } from "expo-linear-gradient";
import { driverRegister } from "../API/actions/register";
import DropDownPicker from "react-native-dropdown-picker";
import {
  AlertNotificationRoot,
  Toast,
  Dialog,
} from "react-native-alert-notification";

export default function DriverLogin({ navigation }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Ambulance", value: 0 },
    { label: "Fire Brigade", value: 2 },
    { label: "Police", value: 1 },
  ]);
  const [Data, setData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    type: null, // 0:ambulance 1:police 2:fire
    license: null,
    passportPhoto: null,
    carPhoto: [],
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setData((prev) => ({ ...prev, type: value }));
  }, [value]);

  React.useEffect(() => {
    const backAction = async () => {
      navigation.navigate("MainScreen");
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener on unmount
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!Data.firstName) newErrors.firstName = "First Name is required.";
    if (!Data.lastName) newErrors.lastName = "Last Name is required.";
    if (!Data.phoneNumber || !/^\d{10}$/.test(Data.phoneNumber))
      newErrors.phoneNumber = "A valid 10-digit Phone Number is required.";
    if (Data.type === null) newErrors.type = "Type is required.";
    if (!Data.email) newErrors.email = "Email is required.";
    if (!Data.license) newErrors.license = "License is required.";
    if (!Data.passportPhoto)
      newErrors.passportPhoto = "Your Photo is required.";
    if (!Data.carPhoto) {
      newErrors.carPhoto = "Car Photos are required.";
    } else if (Data.carPhoto.length < 3)
      newErrors.carPhoto = "Upload atleast 3 car photos.";
    if (!Data.password || Data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (Data.password !== Data.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        const formData = new FormData();

        // Appending non-file fields
        formData.append("first_name", Data.firstName);
        formData.append("last_name", Data.lastName);
        formData.append("phone_number", "+91" + Data.phoneNumber);
        formData.append("email", Data.email);
        formData.append("type", Data.type);
        formData.append("password", Data.password);
        formData.append("confirm_password", Data.password);

        // Append driver photo
        if (Data.passportPhoto) {
          formData.append("driver_pic", {
            uri: Data.passportPhoto,
            type: "image/jpeg",
            name: "driver_photo.jpg",
          });
        }

        // Append license photo
        if (Data.license) {
          formData.append("license_pic", {
            uri: Data.license,
            type: "image/jpeg",
            name: "license.jpg",
          });
        }

        // Append car photos - trying multiple approaches
        if (Data.carPhoto && Data.carPhoto.length > 0) {
          // Approach 1: Simple array
          Data.carPhoto.forEach((photoUri) => {
            formData.append("car_pics", {
              uri: photoUri,
              type: "image/jpeg",
              name: "car_photo.jpg",
            });
          });
        }
        const res = await driverRegister(formData);
        setLoading(false);
        if (res.data?.code) {
          // handleClear();
          Dialog.show({
            autoClose: false,
            type: "SUCCESS",
            title: "🎉 Registration Successful!",
            button: "Ok!!",
            textBody:
              "Our admin team will review your request shortly and notify you via email. \n\nThank you for joining us!",
          });
        } else {
          Toast.show({
            type: "DANGER",
            title: "Registration Failed",
            textBody: showError(res),
          });
        }
      } catch (error) {
        alert("Something went wrong, try again later!");
      }
    }
  };

  const showError = (res) => {
    const response = res?.data;
    if (response?.errors?.[0]) return response.errors[0];
    if (response?.error) return response.error;
    return "Something went wrong!";
  };

  const handleFileUpload = async (field) => {
    const per = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (per.status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: field === "carPhoto" ? false : true,
        allowsMultipleSelection: field === "carPhoto" ? true : false, // Enable multiple selections
        selectionLimit: field === "carPhoto" ? 6 : 1,
        mediaTypes: ["images"],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUris = result.assets.map((asset) => asset.uri); // Extract URIs
        saveImage(imageUris, field);
      }
    } else {
      alert("You must upload all required documents.");
    }
  };

  const saveImage = (images, field) => {
    if (field === "carPhoto") {
      setData((prev) => ({
        ...prev,
        [field]: prev[field] ? [...prev[field], ...images] : images, // Append or initialize the array
      }));
    } else {
      setData((prev) => ({ ...prev, [field]: images[0] })); // Save single image for other fields
    }
  };

  const handleClear = () => {
    setData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      type: null,
      license: null,
      passportPhoto: null,
      carPhoto: [],
      password: "",
      confirmPassword: "",
    });
  };

  const renderDownIcon = () => (
    <Icon
      size={16}
      style={tw`text-gray-400 -ml-6`}
      name="down"
      family="AntDesign"
    />
  );

  const renderUpIcon = () => (
    <Icon
      size={16}
      style={tw`text-gray-400 -ml-6`}
      name="up"
      family="AntDesign"
    />
  );

  return (
    <AlertNotificationRoot>
      <ScrollView style={tw`h-full w-full bg-white`}>
        <ScrollView style={tw` max-h-[200rem] h-full w-full`}>
          {/* Registration Form Section */}
          <LinearGradient
            colors={["#e5e7eb", "#FFFFFF"]}
            style={tw`bg-gray-200 w-full h-fit p-10 pb-24 flex flex-col elevation-20`}
          >
            <Text
              style={tw`text-2xl font-semibold text-violet-600 text-center mb-5`}
            >
              Register
            </Text>
            <View style={tw`mb-1`}>
              <Text style={tw`mb-0`}>First Name *</Text>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Enter First Name"
                value={Data.firstName}
                onChangeText={(text) => setData({ ...Data, firstName: text })}
              />
              {errors.firstName && (
                <Text style={tw`text-red-500`}>{errors.firstName}</Text>
              )}
            </View>

            <View style={tw`mb-1`}>
              <Text style={tw`mb-0`}>Last Name *</Text>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Enter Last Name"
                value={Data.lastName}
                onChangeText={(text) => setData({ ...Data, lastName: text })}
              />
              {errors.lastName && (
                <Text style={tw`text-red-500`}>{errors.lastName}</Text>
              )}
            </View>

            <View style={tw`mb-1`}>
              <Text style={tw`mb-0`}>Phone Number *</Text>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Enter Phone Number"
                keyboardType="numeric"
                value={Data.phoneNumber}
                onChangeText={(text) => setData({ ...Data, phoneNumber: text })}
              />
              {errors.phoneNumber && (
                <Text style={tw`text-red-500`}>{errors.phoneNumber}</Text>
              )}
            </View>

            <View style={tw`mb-1`}>
              <Text style={tw`mb-0`}>Email *</Text>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Enter Email Number"
                value={Data.email}
                onChangeText={(text) => setData({ ...Data, email: text })}
              />
              {errors.email && (
                <Text style={tw`text-red-500`}>{errors.email}</Text>
              )}
            </View>

            <View style={tw`mb-1 w-full`}>
              <Text style={tw`mb-0`}>Organization Type *</Text>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="Select..."
                style={tw`border border-gray-300 bg-white my-2 rounded-lg`}
                textStyle={tw`text-gray-400`}
                dropDownContainerStyle={tw`border border-gray-300`}
                listItemContainerStyle={tw`border-b border-gray-200`}
                listItemLabelStyle={tw`text-gray-400`}
                listMode="SCROLLVIEW"
                nestedScrollEnabled={true}
                ArrowUpIconComponent={renderUpIcon}
                ArrowDownIconComponent={renderDownIcon}
              />
              {errors.type && (
                <Text style={tw`text-red-500`}>{errors.type}</Text>
              )}
            </View>

            <View style={tw`mb-3`}>
              <Text style={tw`mb-2`}>License *</Text>
              {Data.license && (
                <View style={tw`relative ml-2`}>
                  <Icon
                    family="Entypo"
                    size={15}
                    name="cross"
                    color={"black"}
                    style={tw`bg-gray-400 text-white rounded-full p-[1px] w-4 h-4 -mb-2 z-10 -ml-2`}
                    onPress={() => setData({ ...Data, license: null })}
                  />
                  <Image
                    src={Data.license}
                    alt="license"
                    style={tw`mb-2 bg-red-400 w-10 h-10 rounded-md`}
                  />
                </View>
              )}
              <TouchableOpacity
                style={tw`p-3 px-2 rounded-lg bg-white`}
                onPress={() => handleFileUpload("license")}
              >
                <Text style={tw`text-gray-400`}>
                  {Data.license ? "File Selected" : "Upload License"}
                </Text>
              </TouchableOpacity>
              {errors.license && (
                <Text style={tw`text-red-500 mt-2`}>{errors.license}</Text>
              )}
            </View>

            <View style={tw`mb-3`}>
              <Text style={tw`mb-1`}>vehicle Photos *</Text>
              {Data.carPhoto && (
                <ScrollView horizontal style={tw`mb-2`}>
                  {Data.carPhoto.map((uri, index) => (
                    <View key={index} style={tw`relative ml-2`}>
                      <Icon
                        family="Entypo"
                        size={15}
                        name="cross"
                        color={"black"}
                        style={tw`-mb-2 -ml-2 bg-gray-400 text-white rounded-full p-[1px] w-4 h-4 z-10`}
                        onPress={() =>
                          setData((prev) => ({
                            ...prev,
                            carPhoto: prev.carPhoto.filter(
                              (_, i) => i !== index
                            ),
                          }))
                        }
                      />
                      <Image
                        source={{ uri }}
                        style={tw`w-10 h-10 rounded-lg mr-2 z-0`}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
              <TouchableOpacity
                style={tw`p-3 px-2 rounded-lg bg-white`}
                onPress={() => handleFileUpload("carPhoto")}
              >
                <Text style={tw`text-gray-400`}>
                  {Data.carPhoto?.length > 0
                    ? "Add More Photos"
                    : "Upload Car Photos"}
                </Text>
              </TouchableOpacity>
              {errors.carPhoto && (
                <Text style={tw`text-red-500 mt-2`}>{errors.carPhoto}</Text>
              )}
            </View>

            <View style={tw`mb-3`}>
              <Text style={tw`mb-2`}>Your Photo *</Text>
              {Data.passportPhoto && (
                <View style={tw`relative ml-2 mb-2`}>
                  <Icon
                    family="Entypo"
                    size={15}
                    name="cross"
                    color={"black"}
                    style={tw`-mb-2 -ml-2 bg-gray-400 text-white rounded-full p-[1px] w-4 h-4 z-10`}
                    onPress={() => setData({ ...Data, passportPhoto: null })}
                  />
                  <Image
                    source={{ uri: Data.passportPhoto }}
                    style={tw`w-10 h-10 rounded-lg`}
                    resizeMode="cover"
                  />
                </View>
              )}
              <TouchableOpacity
                style={tw`p-3 px-2 rounded-lg bg-white`}
                onPress={() => handleFileUpload("passportPhoto")}
              >
                <Text style={tw`text-gray-400`}>
                  {Data.passportPhoto ? "File Selected" : "Upload Your Photo"}
                </Text>
              </TouchableOpacity>
              {errors.passportPhoto && (
                <Text style={tw`text-red-500 mt-2`}>
                  {errors.passportPhoto}
                </Text>
              )}
            </View>

            <View style={tw`mb-1`}>
              <Text style={tw`mb-0`}>Password *</Text>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Enter Password"
                secureTextEntry
                value={Data.password}
                onChangeText={(text) => setData({ ...Data, password: text })}
              />
              {errors.password && (
                <Text style={tw`text-red-500`}>{errors.password}</Text>
              )}
            </View>

            <View style={tw`mb-3`}>
              <Text style={tw`mb-0`}>Confirm Password *</Text>
              <ArInput
                style={tw`border p-2 rounded-lg`}
                placeholder="Confirm Password"
                secureTextEntry
                value={Data.confirmPassword}
                onChangeText={(text) =>
                  setData({ ...Data, confirmPassword: text })
                }
              />
              {errors.confirmPassword && (
                <Text style={tw`text-red-500`}>{errors.confirmPassword}</Text>
              )}
            </View>

            <Button
              disabled={loading}
              style={tw`w-full bg-violet-600 rounded-2xl elevation-10 m-0 mb-0 ${
                loading ? "bg-opacity-50" : ""
              }`}
              onPress={handleFormSubmit}
            >
              {loading ? (
                <ActivityIndicator
                  color="white"
                  style={tw`h-full w-full bg-violet-600 rounded-2xl bg-opacity-50`}
                />
              ) : (
                "Register"
              )}
            </Button>
          </LinearGradient>
        </ScrollView>
      </ScrollView>
    </AlertNotificationRoot>
  );
}
