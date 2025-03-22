import axios from "axios";
import {
  ACCEPT_REQUEST,
  BASE,
  COMPLETE_REQUEST,
  DRIVER_REGISTER,
  LOGIN,
  LOGOUT,
  REQUEST_CAR,
  REQUEST_DATA,
  USER_REGISTER,
} from "./constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");
  const parsedToken = JSON.parse(token);
  if (parsedToken?.data?.token) {
    req.headers.Authorization = `Token ${parsedToken.data.token}`;
  }
  return req;
});

export const login = (body) => {
  return API.post(`${LOGIN}`, body);
};

export const user_register = (body) => API.post(`${USER_REGISTER}`, body);

export const driver_register = (body) => {
  return API.post(`${DRIVER_REGISTER}`, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const logout = () => API.post(`${LOGOUT}`);

export const request_car = (body) => API.post(`${REQUEST_CAR}`, body);

export const accept_request = (id) => API.post(`${ACCEPT_REQUEST}/${id}/`);

export const request_data = () => API.get(`${REQUEST_DATA}`);

export const complete_request = (id) =>
  API.post(`${COMPLETE_REQUEST}/${id}/complete/`);
