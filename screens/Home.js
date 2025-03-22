import React, { useEffect, useRef, useState } from "react";
import Dialog from "react-native-dialog";
import {
  View,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  PixelRatio,
} from "react-native";
import { Block, Text } from "galio-framework";
import Mapbox, {
  Camera,
  FillExtrusionLayer,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
} from "@rnmapbox/maps";
import Ambulance from "../assets/imgs/Cars/ambulance.png";
import fire from "../assets/imgs/Cars/fire.png";
import Police from "../assets/imgs/Cars/police.png";
import * as Location from "expo-location";
import tw from "twrnc";
import { locationData } from "../constants/contantFunctions/contants";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Dimensions } from "react-native";
import { Icon } from "../components";
const { height } = Dimensions.get("screen");
import * as Linking from "expo-linking";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import GeminiChat from "../components/ChatBot";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For AsyncStorage
import { useWebSocket } from "./socket";
import {
  acceptRequest,
  cancleRequest,
  completeRequest,
  requestCar,
  requestData,
} from "./API/actions/request";
import RadarPing from "./Widget/temp";
import car from "../assets/imgs/car.png";
import { BASE } from "./API/constants";
import userPic from "../assets/imgs/user.png";
import Compass from "./Widget/Compass";

Mapbox.setAccessToken(
  "pk.eyJ1IjoidGVqYXNjb2RlNDciLCJhIjoiY200d3pqMGh2MGtldzJwczgwMTZnbHc0dCJ9.KyxtwzKWPT9n1yDElo8HEQ"
);

const Home = () => {
  const [uiState, setUiState] = useState({
    visible: false, // Dialog visibility
    isMapLoading: true, // Map loading indicator
    showMap: true, // Map visibility
    sheetArrow: 0, // Bottom sheet arrow direction
    open: false, // Sidebar open state
    isRotation: false,
    isRequested: "",
    requestedData: "",
  });
  const [compassHeading, setCompassHeading] = useState(0);
  const bottomSheetRef = useRef(null);
  const [socketData, setSocketData] = useState([]);
  const [locData, setLocData] = useState(null);
  const [loc, setLoc] = useState(null);
  const [role, setRole] = useState("");
  const snapPoints = [150, height * 0.5];
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [updatedLocation, setUpdatedLocation] = useState(null);
  const width = useSharedValue(0); // Start with 0 width
  const opacity = useSharedValue(0); // Start with 0 opacity
  const [requestAccepted, setRequestAccepted] = useState("");
  const [routeDirections, setRouteDirections] = useState({
    routeThings: null,
    routeTime: {},
  });
  const [cameraProps, setCameraProps] = useState({
    zoom: 11.5 * (PixelRatio.get() / 2),
    bearing: 0,
    pitch: 50,
    shouldUpdateCamera: null,
  });
  const [orderCompleted, setOrderCompleted] = useState("false");
  const { sendLocation } = useWebSocket(
    loc,
    setSocketData,
    setUpdatedLocation,
    setOrderCompleted
  );

  useEffect(() => {
    // Create a reference to know if we should update the camera based on rotation
    if (uiState.isRotation) {
      setCameraProps((prev) => ({
        ...prev,
        shouldUpdateCamera: true,
      }));
    }
  }, [uiState.isRotation, compassHeading]);

  useEffect(() => {
    if (uiState.open) {
      width.value = withSpring(1, { stiffness: 100, damping: 20 });
      opacity.value = withSpring(1, { stiffness: 100, damping: 20 });
    } else {
      width.value = withSpring(0, { stiffness: 100, damping: 20 });
      opacity.value = withSpring(0, { stiffness: 100, damping: 20 });
    }
  }, [uiState.open]);

  useEffect(() => {
    if (orderCompleted !== "false") {
      clear();
    }
  }, [orderCompleted]);

  useEffect(() => {
    const saveSelectedData = async () => {
      try {
        if (selectedData !== null) {
          const jsonValue = JSON.stringify(selectedData);
          // console.log("Saving selectedData to AsyncStorage:", jsonValue);
          await AsyncStorage.setItem("selectedData", jsonValue);
        }
        // } else {
        //   console.log(
        //     "Not saving selectedData because it is null or undefined"
        //   );
        // }
      } catch (error) {
        console.error("Error saving selectedData:", error);
      }
    };

    saveSelectedData();
  }, [selectedData]);

  useEffect(() => {
    const saveToLocal = async () => {
      try {
        if (requestAccepted !== "")
          await AsyncStorage.setItem(
            "requestAccepted",
            JSON.stringify(requestAccepted)
          );
      } catch (error) {
        console.error("Error saving requestAccepted:", error);
      }
    };
    saveToLocal();
  }, [requestAccepted]);

  useEffect(() => {
    const saveToLocal = async () => {
      try {
        if (uiState.isRequested !== "") {
          await AsyncStorage.setItem(
            "isRequested",
            JSON.stringify(uiState.isRequested)
          );
        }
      } catch (error) {
        console.error("Error saving isRequested:", error);
      }
    };

    saveToLocal();
  }, [uiState.isRequested]);

  useEffect(() => {
    const saveToLocal = async () => {
      if (socketData?.type === "order_completed_event")
        setOrderCompleted("true");
      else if (socketData !== null)
        try {
          if (typeof socketData === "object" && !Array.isArray(socketData)) {
            await AsyncStorage.setItem(
              "socketData",
              JSON.stringify(socketData)
            );
          }
        } catch (error) {
          console.error("Error saving socketData:", error);
        }
    };

    saveToLocal();
  }, [socketData]);

  useEffect(() => {
    const loadFromLocal = async () => {
      try {
        const isRequestedStr = await AsyncStorage.getItem("isRequested");
        const requestAcceptedStr = await AsyncStorage.getItem(
          "requestAccepted"
        );
        const selectedDataStr = await AsyncStorage.getItem("selectedData");
        const socketDataStr = await AsyncStorage.getItem("socketData");
        // console.log(socketDataStr);
        // Parse the string to boolean or keep as string based on your needs
        setUiState((prev) => ({
          ...prev,
          isRequested: JSON.parse(isRequestedStr),
        }));
        // Directly parse to boolean
        setRequestAccepted(JSON.parse(requestAcceptedStr));

        setSelectedData(JSON.parse(selectedDataStr));

        const temp = JSON.parse(socketDataStr);
        if (typeof temp === "object" && !Array.isArray(temp) && temp !== null) {
          setSocketData(temp);
        }
      } catch (error) {
        console.error("Error loading from local storage:", error);
      }
    };

    loadFromLocal();
  }, []);

  useEffect(() => {
    const getRole = async () => {
      const token = await AsyncStorage.getItem("token"); // Get token from AsyncStorage
      const parsedToken = JSON.parse(token);
      setRole(parsedToken.data?.profile?.user_type);
    };
    getRole();
  }, []);

  useEffect(() => {
    requestPermission();

    const backAction = async () => {
      const token = await AsyncStorage.getItem("token"); // Get token from AsyncStorage
      const parsedToken = JSON.parse(token);
      if (parsedToken.data?.token) {
        // If token exists, exit the app
        BackHandler.exitApp();
        return true; // Prevent default back action
      } else {
        return false; // Proceed with default back action
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener on unmount
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (loc) {
        let temp = await locationData(loc);
        setLocData(temp);
      }
    };
    getData();
  }, [loc]);

  useEffect(() => {
    if (
      selectedData?.data?.location?.lat &&
      selectedData?.data?.location?.lon
    ) {
      createRoute();
    }
  }, [socketData, selectedData, loc]);

  useEffect(() => {
    if (updatedLocation !== null) createRoute();
  }, [updatedLocation]);

  useEffect(() => {
    let locationSubscription;
    let subscription;
    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission not granted");
          return;
        }
        subscription = await Location.watchHeadingAsync((headingData) => {
          // headingData.trueHeading is the heading relative to true north
          // headingData.magHeading is the heading relative to magnetic north
          setCompassHeading(headingData.trueHeading || headingData.magHeading);
        });

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Check location every 5 seconds
            distanceInterval: 100, // Trigger update if moved by 10 meters
          },
          (newLocation) => {
            // console.log("New Location:", newLocation.coords);
            sendLocation([
              newLocation.coords.longitude,
              newLocation.coords.latitude,
            ]);
            setLoc([newLocation.coords.longitude, newLocation.coords.latitude]);
          }
        );
      } catch (error) {
        console.error("Error tracking location:", error);
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLoc([location.coords.longitude, location.coords.latitude]);
        return;
      } else {
        setIsMapLoading(false);
        setUiState((prev) => ({ ...prev, showMap: false }));

        alert("You must grant location permission for tracking!");
      }
    } catch (error) {
      setUiState((prev) => ({ ...prev, showMap: false }));

      console.error("Error requesting permissions or getting location:", error);
      alert("Error while getting location, please try again later!");
    }
  };

  const handleMapLoad = () => {
    setUiState((prev) => ({ ...prev, isMapLoading: false }));
  };

  const call = (num) => {
    Linking.openURL(`tel:${num}`);
  };

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      width: width.value * 100 + "%", // Cover the full screen width
      opacity: opacity.value, // Transition opacity
    };
  });

  const handleRequest = async (type) => {
    let body;
    if (loc[0] && loc[1])
      body = {
        request_type: JSON.stringify(type),
        latitude: JSON.stringify(loc[1]),
        longitude: JSON.stringify(loc[0]),
        additional_details: JSON.stringify(locData),
      };
    else {
      alert("Could not get your location right now!");
      return;
    }

    try {
      const res = await requestCar(body);
      if (res?.code === 201) {
        console.log(JSON.stringify(res, null, 2));
        setUiState((prev) => ({
          ...prev,
          isRequested: true,
          requestedData: res,
        }));
      } else alert("Something went wrong!!");
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  };

  const returnImageSource = (type) => {
    switch (type) {
      case "Fire Brigade":
        return fire;
      case "Ambulance":
        return Ambulance;
      case "Police":
        return Police;
      default:
        return type;
    }
  };

  const parseAdditionalData = (data) => {
    if (typeof data === "string") {
      const temp = JSON.parse(data?.data?.additional_details);
      return temp?.display_name;
    } else if (typeof data?.data?.additional_details === "string") {
      const temp = JSON.parse(data.data?.additional_details);
      return temp?.display_name;
    } else return data?.data?.additional_details?.display_name;
  };

  const handleAccept = async (id) => {
    try {
      const res = await acceptRequest(id);
      if (res?.code === 200) {
        setRequestAccepted(true);
      } else {
        alert("Something went wrong!");
        console.log(res);
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  };

  const showDialog = (data) => {
    setSelectedId(data.id);
    setSelectedData(data);
    setUiState((prev) => ({ ...prev, visible: true }));
  };

  const handleCancel = () => {
    setUiState((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirm = () => {
    if (selectedId) {
      handleAccept(selectedId);
      setUiState((prev) => ({ ...prev, visible: false }));
    }
  };

  const makeRouterFeature = (loc) => {
    const route = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: loc,
          },
        },
      ],
    };
    return route;
  };

  const createRoute = async () => {
    const startCoords = `${loc[0]},${loc[1]}`;
    let endCoords;
    if (selectedData)
      endCoords = `${selectedData.data.location.lon},${selectedData.data.location.lat}`;
    else
      endCoords = `${updatedLocation?.longitude},${updatedLocation?.latitude}`;

    const geometries = "geojson";
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords};${endCoords}?alternatives=true&geometries=${geometries}&steps=true&banner_instructions=true&overview=full&voice_instructions=true&access_token=pk.eyJ1IjoidGVqYXNjb2RlNDciLCJhIjoiY200d3pqMGh2MGtldzJwczgwMTZnbHc0dCJ9.KyxtwzKWPT9n1yDElo8HEQ`;

    try {
      let res = await fetch(url);
      let json = await res.json();

      processMapboxResponse(json);

      // Ensure routes exist
      if (!json.routes || json.routes.length === 0) {
        console.log("No routes found in response!", json);
        return;
      }

      // Extract coordinates
      let coordinates = json.routes[0]?.geometry?.coordinates;
      if (coordinates?.length) {
        // console.log("Route Coordinates:", coordinates);
        const routerFeature = makeRouterFeature([...coordinates]);
        setRouteDirections((prev) => ({ ...prev, routeThings: routerFeature }));
      } else {
        console.error("No coordinates found in route geometry!");
      }

      // To this
      setCameraProps((prev) => ({
        ...prev,
        pitch: 55,
        zoom: prev.zoom === 16 ? 18 : prev.zoom,
      }));
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const processMapboxResponse = (response) => {
    if (!response || !response.routes || response.routes.length === 0) {
      return "Invalid response";
    }

    let distanceMeters = response.routes[0].distance; // Extract distance in meters
    let durationSeconds = response.routes[0].duration; // Extract duration in seconds

    // Convert meters to kilometers
    let kilometers = (distanceMeters / 1000).toFixed(2);

    // Convert seconds to minutes and seconds
    let minutes = Math.floor(durationSeconds / 60);
    let remainingSeconds = Math.round(durationSeconds % 60);

    setRouteDirections((prev) => ({
      ...prev,
      routeTime: {
        km: kilometers,
        min: minutes,
        sec: remainingSeconds,
      },
    }));
  };

  const cancleCarRequest = async () => {
    try {
      const reqId = uiState.requestedData?.data?.id;
      const res = await cancleRequest(reqId);
      if (res?.code === 200) {
        setUiState((prev) => ({ ...prev, isRequested: false }));
      } else alert("Something went wrong!!");
    } catch (error) {
      alert("Something went wrong!");
    }
  };

  const clear = async () => {
    try {
      // Clear AsyncStorage items
      await AsyncStorage.removeItem("selectedData");
      await AsyncStorage.removeItem("requestAccepted");
      await AsyncStorage.removeItem("isRequested");
      await AsyncStorage.removeItem("socketData");

      setSocketData([]);
      setLocData(null);
      setLoc(null);
      setRole("");
      setUiState((prev) => ({
        ...prev,
        isRequested: "",
      }));
      setSelectedId(null);
      setSelectedData(null);
      setUpdatedLocation(null);
      setRequestAccepted("");
      setRouteDirections({
        routeThings: null,
        routeTime: {},
      });

      console.log("All states reset to default values");
    } catch (error) {
      console.log("Error clearing states:", error);
    }
  };

  const callCompleteRequest = async (id) => {
    try {
      const res = await completeRequest(id);
      if (res?.code === 200) clear();
      else alert("Something went wrong!");
    } catch (error) {
      alert("Something went wrong!!");
    }
  };

  const toggleSidebar = () => {
    setUiState((prev) => ({ ...prev, open: !prev.open }));
  };

  return (
    <Block flex center style={tw`w-full`}>
      <Dialog.Container visible={uiState.visible}>
        <Dialog.Title>Confirm Acceptance</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to accept this request?
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={handleCancel} />
        <Dialog.Button label="Accept" onPress={handleConfirm} />
      </Dialog.Container>
      {uiState.isMapLoading && (
        <View
          style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white/80 z-1`}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={tw`mt-2 text-base text-black`}>Loading map...</Text>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setUiState((prev) => ({ ...prev, open: !prev.open }))}
        style={tw`z-1000 absolute z-10 top-0 right-0 bg-violet-600 rounded-full p-5 m-2 py-4.5`}
      >
        <FontAwesome6 name="user-doctor" size={20} color="white" />
      </TouchableOpacity>

      {!uiState.isMapLoading && (
        <TouchableOpacity
          style={tw`z-0 absolute z-10 top-5 left-0 rounded-full m-2 py-2`}
        >
          <Compass
            onPress={() =>
              setUiState((prev) => ({
                ...prev,
                isRotation: !uiState.isRotation,
              }))
            }
          />
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.sidebar, sidebarStyle, { zIndex: 1000 }]}>
        <View style={styles.bg}>
          <GeminiChat setOpen={toggleSidebar} open={uiState.open} />
        </View>
      </Animated.View>
      {loc && locData && uiState.showMap && (
        <MapView
          style={tw`h-full w-full`}
          styleURL="mapbox://styles/mapbox/navigation-day-v1" // Change to night mode (dark theme)
          zoomEnabled
          rotateEnabled
          onDidFinishLoadingStyle={handleMapLoad}
          onMapLoadingError={() =>
            alert("Something went wrong while loading the map!")
          }
          onMapIdle={(region) => {
            setCameraProps({
              zoom: region.properties.zoom,
              bearing: region.properties.heading,
              pitch: region.properties.pitch,
            });
          }}
        >
          {/* 3D Custom Layer for Dynamic Effects */}
          <FillExtrusionLayer
            id="3d-dynamic"
            sourceLayerID="building"
            style={{
              fillExtrusionColor: [
                "case",
                ["==", ["get", "type"], "skyscraper"],
                "#000", // Highlight skyscrapers with a bright color
                "#d6e0f0", // Default color for other buildings
              ],
              fillExtrusionHeight: [
                "interpolate",
                ["linear"],
                ["get", "height"],
                0,
                0,
                120,
                500, // Dynamic height for specific types
              ],
              fillExtrusionOpacity: 0.5,
            }}
          />
          {/* Camera Settings */}
          {(cameraProps.zoom === 11.5 * (PixelRatio.get() / 2) ||
            cameraProps.shouldUpdateCamera) && (
            <Camera
              pitch={40}
              centerCoordinate={loc}
              zoomLevel={cameraProps.zoom}
              heading={
                uiState.isRotation ? compassHeading : cameraProps.bearing
              }
              animationMode="flyTo"
              animationDuration={2000}
              onComplete={() => {
                // Reset the flag after camera animation completes
                if (cameraProps.shouldUpdateCamera) {
                  setCameraProps((prev) => ({
                    ...prev,
                    shouldUpdateCamera: false,
                  }));
                }
              }}
            />
          )}

          {/* Marker for the Current Location */}
          <PointAnnotation id="marker" style={tw`h-10 w-10`} coordinate={loc}>
            {/* <View /> */}
            {role === "driver" ? (
              <View />
            ) : (
              <View style={tw`h-10 w-10`}>
                <Icon
                  name={"squared-plus"}
                  size={30}
                  family="Entypo"
                  style={tw`text-red-500`}
                />
              </View>
            )}
          </PointAnnotation>
          {routeDirections?.routeThings && (
            <ShapeSource id="line1" shape={routeDirections?.routeThings}>
              <LineLayer
                id="routerLine01"
                style={{
                  lineColor: "#7f22fe",
                  lineWidth: 10,
                }}
              />
            </ShapeSource>
          )}

          {socketData?.type === "order_accepted_event" &&
            "driver" in socketData && (
              <PointAnnotation
                id="driver"
                style={tw`h-10 w-10`}
                coordinate={[
                  socketData?.location?.lon,
                  socketData?.location?.lat,
                ]}
              >
                <View />
              </PointAnnotation>
            )}

          {updatedLocation?.type === "location_update" &&
            role === "customer" && (
              <PointAnnotation
                id="driver_update"
                style={tw`h-10 w-10`}
                coordinate={[
                  updatedLocation?.longitude,
                  updatedLocation?.latitude,
                ]}
              >
                <View>
                  <Image source={car} style={tw`h-10 w-10`} />
                </View>
              </PointAnnotation>
            )}

          {selectedData?.data?.location?.lat &&
            selectedData?.data?.location?.lon && (
              <PointAnnotation
                id="driver2"
                style={tw`h-10 w-10`}
                coordinate={[
                  selectedData?.data?.location?.lon,
                  selectedData?.data?.location?.lat,
                ]}
              >
                <View style={tw`h-10 w-10`}>
                  <Icon
                    name={"squared-plus"}
                    size={30}
                    family="Entypo"
                    style={tw`text-red-500`}
                  />
                </View>
              </PointAnnotation>
            )}
        </MapView>
      )}
      {!uiState.showMap && (
        <View style={tw`flex h-full items-center justify-center`}>
          <Text
            style={tw`text-lg text-center text-red-400 font-medium tracking-widest`}
          >
            Please grant location!
          </Text>
        </View>
      )}
      {role === "driver" && (
        <BottomSheet
          containerStyle={{ zIndex: 10 }}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          onChange={(e) => setUiState((prev) => ({ ...prev, sheetArrow: e }))}
          backgroundStyle={tw`bg-gray-100 rounded-t-3xl`}
          handleIndicatorStyle={tw`hidden`}
          handleComponent={() => (
            <View style={tw`items-center my-2`}>
              <Icon
                name={uiState.sheetArrow === 0 ? "chevron-up" : "chevron-down"}
                size={30}
                family="entypo"
                style={tw`text-gray-500`}
              />
            </View>
          )}
        >
          {requestAccepted ? (
            <BottomSheetScrollView
              style={tw`flex-1 px-4`}
              contentContainerStyle={tw`pb-10`}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              <TouchableOpacity
                onPress={() => {
                  clear();
                }}
                style={tw`bg-violet-600 p-3 py-3 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-center items-center`}
              >
                <Text style={tw`text-white`}>Cancle Request</Text>
              </TouchableOpacity>
              <View
                style={tw`bg-white p-4 h-fit rounded-lg mb-3 shadow-md flex items-center`}
              >
                <View
                  style={tw`w-full flex flex-row justify-between items-center pr-2`}
                >
                  <View style={tw`flex flex-row items-center `}>
                    <View
                      style={[
                        { flexShrink: 1 },
                        tw`flex w-full overflow-hidden`,
                      ]}
                    >
                      <Text style={tw`text-sm text-gray-500`}>
                        {parseAdditionalData(selectedData)}&nbsp;
                        <Text style={tw`font-bold`}>
                          ({routeDirections?.routeTime?.km} km)
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={tw`bg-white p-4 h-fit rounded-lg mb-3 shadow-md flex items-center`}
              >
                <View
                  style={tw`w-full flex flex-row justify-between items-center pr-2`}
                >
                  <View style={tw`w-[90%] flex flex-row items-center`}>
                    <View style={tw`flex w-full overflow-hidden`}>
                      <Text style={tw`text-lg text-gray-500`}>
                        {selectedData?.data?.user?.phone}
                      </Text>
                    </View>
                  </View>
                  <Icon
                    onTouchStart={() => {
                      call(selectedData?.data?.user?.phone);
                    }}
                    name="phone"
                    family="FontAwesome"
                    size={40}
                    style={tw`text-green-500 mr-2`}
                  />
                </View>
              </View>
            </BottomSheetScrollView>
          ) : (
            <BottomSheetScrollView
              style={tw`flex-1 px-4`}
              contentContainerStyle={tw`pb-10`}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {socketData?.length > 0 ? (
                socketData?.map((data, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => showDialog(data)}
                    style={tw`bg-white p-3 py-1 h-fit rounded-lg mb-3 shadow-md flex flex-row items-center`}
                  >
                    <View
                      style={tw`w-full flex flex-row justify-between w-full items-center pr-2`}
                    >
                      <View style={tw`flex flex-row items-center `}>
                        <Image
                          source={returnImageSource(data.data?.request_type)}
                          style={tw`w-20 h-20 mr-3`}
                        />
                        <View
                          style={[
                            { flexShrink: 1 },
                            tw`flex w-full overflow-hidden`,
                          ]}
                        >
                          <Text style={tw`text-lg font-bold`}>
                            {data.data?.request_type} Needed
                          </Text>
                          <Text style={tw`text-sm text-gray-500`}>
                            {parseAdditionalData(data)}
                          </Text>
                        </View>
                      </View>
                      {/* <Icon
                      onTouchStart={() => call(data.data?.user?.phone)}
                      name="phone"
                      family="FontAwesome"
                      size={40}
                      style={tw`text-green-500 mr-2 w-[10%]`}
                    /> */}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={tw`bg-white p-3 py-1 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-between items-center`}
                >
                  <View
                    style={tw`flex flex-row justify-between w-full items-center`}
                  >
                    <View style={tw`flex flex-row items-center gap-3 py-2`}>
                      <Icon
                        name={"coffee"}
                        size={35}
                        family="FontAwesome"
                        style={tw`text-orange-700`}
                      />
                      <View style={tw`flex`}>
                        <Text style={tw`text-lg font-bold`}>
                          No requests for now
                        </Text>
                        <Text style={tw`text-sm text-gray-500 w-fit`}>
                          Relax but hang tight, a request might come in any
                          moment!
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      )}
      {role === "customer" && (
        <BottomSheet
          containerStyle={{ zIndex: 100 }}
          ref={bottomSheetRef}
          enableDynamicSizing
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          backgroundStyle={tw`bg-gray-100 rounded-t-3xl`}
          handleIndicatorStyle={tw`hidden`}
          handleComponent={() => (
            <View style={tw`items-center my-2`}>
              <Icon
                name={uiState.sheetArrow === 0 ? "chevron-up" : "chevron-down"}
                size={30}
                family="entypo"
                style={tw`text-gray-500`}
              />
            </View>
          )}
        >
          {uiState.isRequested ? (
            <BottomSheetScrollView style={tw`flex-1 px-4`}>
              {socketData?.type === "order_accepted_event" &&
              "driver" in socketData ? (
                <>
                  <TouchableOpacity
                    onPress={() => callCompleteRequest(socketData?.id)}
                    style={tw`bg-violet-600 p-3 py-3 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-center items-center`}
                  >
                    <Text style={tw`text-white`}>Complete Order</Text>
                  </TouchableOpacity>

                  <View
                    style={tw`w-full h-18 bg-white rounded-lg shadow-md mb-2`}
                  >
                    <View style={tw`flex flex-row items-center gap-2 h-full`}>
                      <Image
                        source={
                          socketData?.driver?.profile_pic
                            ? {
                                uri: `${BASE}/${socketData?.driver?.profile_pic}`,
                              }
                            : userPic
                        }
                        style={tw`h-full w-20 rounded-l-lg`}
                      />
                      <View style={tw`flex h-full justify-center`}>
                        <Text style={tw`font-sm text-[0.8rem] text-gray-600`}>
                          {socketData?.driver?.name}
                        </Text>
                        <Text
                          style={tw`font-sm text-[0.8rem] text-gray-600 gap-2`}
                        >
                          Reaching in&nbsp;
                          {routeDirections?.routeTime?.min}min&nbsp;
                          {routeDirections?.routeTime?.sec}sec
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={tw`bg-white p-4 h-fit rounded-lg mb-3 shadow-md flex items-center`}
                  >
                    <View
                      style={tw`w-full flex flex-row justify-between items-center pr-2`}
                    >
                      <View style={tw`w-[90%] flex flex-row items-center`}>
                        <View style={tw`flex w-full overflow-hidden`}>
                          <Text style={tw`text-lg text-gray-500`}>
                            {socketData?.driver?.phone}
                          </Text>
                        </View>
                      </View>
                      <Icon
                        onTouchStart={() => {
                          call(socketData?.driver?.phone);
                        }}
                        name="phone"
                        family="FontAwesome"
                        size={40}
                        style={tw`text-green-500 mr-2`}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <ScrollView
                  style={tw`flex-1`}
                  contentContainerStyle={tw`pb-10`}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={tw`text-lg font-medium text-center mb-2`}>
                    Finding the nearest driver
                  </Text>
                  <View
                    style={tw`bg-white active:bg-red-400 p-3 py-2 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-center items-center overflow-hidden`}
                  >
                    <View
                      style={tw`flex flex-row justify-between items-center`}
                    >
                      <View style={tw`w-1/3 bg-violet-600 h-[2px]`} />
                      <RadarPing />
                      <View style={tw`w-1/3 bg-violet-600 h-[2px]`} />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => cancleCarRequest()}
                    style={tw`bg-violet-600 p-3 py-3 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-center items-center`}
                  >
                    <Text style={tw`text-white`}>Cancle Request</Text>
                  </TouchableOpacity>
                  <View style={tw`flex gap-3 text-md`}>
                    <View
                      style={tw`bg-white p-3 rounded-lg h-fit shadow-md flex flex-row justify-between items-center`}
                    >
                      <View style={tw`flex flex-row items-center`}>
                        <View style={tw`flex`}>
                          <Text style={tw`text-lg font-bold`}>
                            How this works
                          </Text>
                          <Text style={tw`text-sm text-gray-500`}>
                            This sends your request to all the available drivers
                            and when they accept the request you both can be
                            with each other as soon as possible
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={tw`bg-white p-3 rounded-lg mb-3 h-fit shadow-md flex flex-row justify-between items-center`}
                    >
                      <View style={tw`flex flex-row items-center`}>
                        <View style={tw`flex`}>
                          <Text style={tw`text-lg font-bold`}>Note</Text>
                          <Text style={tw`text-sm text-gray-500`}>
                            We don't know how much time this could take
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            </BottomSheetScrollView>
          ) : (
            <BottomSheetScrollView style={tw`flex-1 px-4`}>
              <ScrollView
                style={tw`flex-1`}
                contentContainerStyle={tw`pb-10`}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  onPress={() => call("108")}
                  style={tw`bg-white active:bg-red-400 p-3 py-1 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-between items-center`}
                >
                  <View style={tw`flex flex-row items-center gap-2 py-2`}>
                    <View>
                      <Icon
                        name="phone"
                        family="FontAwesome"
                        size={40}
                        style={tw`text-green-500 mr-1`}
                      />
                    </View>
                    <View style={tw`flex`}>
                      <Text style={tw`text-lg font-bold`}>Call 108</Text>
                      <Text style={tw`text-sm text-gray-500 w-fit`}>
                        Call to emergency helpline
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRequest(0)}
                  style={tw`bg-white p-3 py-1 h-fit rounded-lg mb-3 shadow-md flex flex-row justify-between items-center`}
                >
                  <View style={tw`flex flex-row items-center`}>
                    <Image source={Ambulance} style={tw`w-16 h-20 mr-5`} />
                    <View style={tw`flex`}>
                      <Text style={tw`text-lg font-bold`}>Ambulance</Text>
                      <Text style={tw`text-sm text-gray-500`}>
                        Notify nearest ambulances
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRequest(1)}
                  style={tw`bg-white p-3 rounded-lg mb-3 h-fit shadow-md flex flex-row justify-between items-center`}
                >
                  <View style={tw`flex flex-row items-center`}>
                    <Image source={fire} style={tw`w-16 h-16 mr-5`} />
                    <View style={tw`flex`}>
                      <Text style={tw`text-lg font-bold`}>Fire Brigade</Text>
                      <Text style={tw`text-sm text-gray-500`}>
                        Notify nearest fire brigade
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRequest(2)}
                  style={tw`bg-white p-3 rounded-lg h-fit shadow-md flex flex-row justify-between items-center`}
                >
                  <View style={tw`flex flex-row items-center`}>
                    <Image source={Police} style={tw`w-14 h-16 mr-5`} />
                    <View style={tw`flex`}>
                      <Text style={tw`text-lg font-bold`}>Police</Text>
                      <Text style={tw`text-sm text-gray-500`}>
                        Notify nearest police
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      )}
    </Block>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "red",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    // backgroundColor: "red", // Semi-transparent dark background
    zIndex: 10,
  },
  bg: {
    flex: 1,
    // backgroundColor: "red", // Your sidebar's background color
  },
  toggleButton: {
    position: "absolute",
    bottom: 50,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
});
