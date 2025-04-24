import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useWebSocket = (
  loc,
  setSocketData,
  setUpdatedLocation,
  setIsCompleted,
  socketData
) => {
  const socketRef = useRef(null);
  const [socketUrl, setSocketUrl] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("No token found in AsyncStorage");
          return;
        }
        const parsedToken = JSON.parse(token);
        const userToken = parsedToken?.data?.token;
        const username = parsedToken?.data?.profile.username;

        if (userToken && username) {
          const wsUrl = `ws://16.170.204.90/ws/user/${username}/?token=${userToken}`;
          setSocketUrl(wsUrl);
        } else {
          console.error("Token or username missing!");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    let role;
    const getRole = async () => {
      const token = await AsyncStorage.getItem("token"); // Get token from AsyncStorage
      const parsedToken = JSON.parse(token);
      role = parsedToken;
    };
    getRole();

    if (socketUrl) {
      console.log("Connecting...");
      socketRef.current = new WebSocket(socketUrl);
      socketRef.current.onopen = () => {
        console.log("WebSocket Connected");
        if (loc) sendLocation(loc); // Send location when WebSocket opens
      };

      socketRef.current.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);

        if (typeof event.data === "string") {
          if (parsedData?.type === "order_completed_event") {
            setIsCompleted(true);
          } else if ("driver" in parsedData) {
            // console.log("Received:", JSON.stringify(parsedData, null, 2));
            setSocketData(parsedData);
          } else if (parsedData?.type === "location_update")
            setUpdatedLocation(parsedData);
          else if (parsedData?.status === "ignored") {
            if (Array.isArray(socketData)) {
              setSocketData((prevData) => {
                return prevData.filter((item) => item.id !== parsedData.id);
              });
            }
          } else if (parsedData?.id) {
            setSocketData((prevData) => {
              if (!Array.isArray(prevData)) return [parsedData];
              return [...prevData, parsedData];
            });
          }
        }
      };

      socketRef.current.onerror = (error) => {
        console.log("WebSocket Error:", error);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket Disconnected");
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [socketUrl]);

  // **New Effect: Send location every time it updates**
  useEffect(() => {
    if (loc) {
      sendLocation(loc);
    }
  }, [loc]); // This will trigger every time `loc` changes

  const sendLocation = (location) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const data = JSON.stringify({
        latitude: location[1],
        longitude: location[0],
      });
      socketRef.current.send(data);
      // console.log("Sent:", data);
    } else {
      console.log("WebSocket not open, cannot send location");
    }
  };

  return { sendLocation };
};
