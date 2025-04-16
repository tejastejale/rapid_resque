import * as API from "../index";

export const requestCar = async (body) => {
  try {
    const res = await API.request_car(body);
    return res.data;
  } catch (error) {
    return error;
  }
};

export const acceptRequest = async (id) => {
  try {
    const res = await API.accept_request(id);
    return res.data;
  } catch (error) {
    return error;
  }
};

export const requestData = async () => {
  try {
    const res = await API.request_data();
    return res.data;
  } catch (error) {
    return error;
  }
};

export const completeRequest = async (id) => {
  try {
    const res = await API.complete_request(id);
    return res.data;
  } catch (error) {
    return error;
  }
};

export const cancleRequest = async (id) => {
  try {
    const res = await API.cancle_request(id);
    return res.data;
  } catch (error) {
    return error;
  }
};

export const getPendingRequests = async () => {
  try {
    const res = await API.get_pending_reqs();
    return res.data;
  } catch (error) {
    return error;
  }
};

export const getCurrentRequest = async () => {
  try {
    const res = await API.get_current_state();
    return res.data;
  } catch (error) {
    return error;
  }
};
