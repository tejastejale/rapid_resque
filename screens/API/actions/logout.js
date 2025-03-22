import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "..";

export const makeLogout = async () => {
  try {
    const res = await logout();
    const keys = await AsyncStorage.getAllKeys();
    const aRes = await AsyncStorage.multiRemove(keys);
    return res.data;
  } catch (error) {
    return error;
  }
};
