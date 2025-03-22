import { driver_register, user_register } from "..";

export const userRegister = async (body) => {
  try {
    const res = await user_register(body);
    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const driverRegister = async (body) => {
  try {
    const res = await driver_register(body);
    return res;
  } catch (error) {
    return error.response?.data;
  }
};
