import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../index";

export const makeLogin = async (body) => {
  try {
    const res = await login(body);
    const token = JSON.stringify(res.data);
    await AsyncStorage.setItem("token", token);
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};
