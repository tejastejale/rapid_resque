import {
  ActivityIndicator,
  Animated,
  Button,
  Dimensions,
  Easing,
  Text,
  View,
} from "react-native";
import { Header, Icon } from "../components";
import { argonTheme, tabs } from "../constants";
import Articles from "../screens/Articles";
import { Block } from "galio-framework";
import CustomDrawerContent from "./Menu";
import Elements from "../screens/Elements";
import Home from "../screens/Home";
import Onboarding from "../screens/Onboarding";
import Pro from "../screens/Pro";
import Profile from "../screens/Profile";
import React, { useEffect, useState } from "react";
import Register from "../screens/Register";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import MainScreen from "../screens/Login/Main";
import UserLogin from "../screens/Login/UserRegister";
import DriverLogin from "../screens/Login/DriverRegister";
import Login from "../screens/Login/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import Loading from "../screens/Widget/Loading";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function ProfileStack(props) {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              transparent
              white
              title="Profile"
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#FFFFFF" },
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Pro"
        component={Pro}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Home"
              search
              options
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Pro"
        component={Pro}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}

function LoginStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="UserLogin" component={UserLogin} />
      <Stack.Screen name="DriverLogin" component={DriverLogin} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

function AppStack({ initialRouteName }) {
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      drawerStyle={{
        backgroundColor: "white",
        width: width * 0.8,
      }}
      screenOptions={({ route }) => ({
        swipeEnabled: !["Login", "MainScreen", "Register"].includes(route.name),
      })}
      drawerContentOptions={{
        activeTintcolor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal",
        },
      }}
      initialRouteName={initialRouteName}
    >
      <Drawer.Screen
        name="Login"
        component={LoginStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function OnboardingStack() {
  const [initialRoute, setInitialRoute] = useState("Login");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        let obj = JSON.parse(token);
        if (obj?.data?.token) {
          setInitialRoute("Home");
        }
      } catch (error) {
        console.log("Error checking token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false,
      }}
    >
      <Stack.Screen name="App">
        {(props) => <AppStack {...props} initialRouteName={initialRoute} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
