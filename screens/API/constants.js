export const BASE = "http://16.170.204.90";

export const LOGIN = `${BASE}/auth-api/login/`;

export const LOGOUT = `${BASE}/auth-api/logout/`;

export const USER_REGISTER = `${BASE}/auth-api/register/`;

export const DRIVER_REGISTER = `${BASE}/auth-api/driver/register/`;

export const WEB_SOCKET = `ws://16.170.204.90/ws/user`;

export const REQUEST_CAR = `${BASE}/request-api/request-car/`;

export const ACCEPT_REQUEST = `${BASE}/request-api/accept-request`;

export const REQUEST_DATA = `${BASE}/request-api/car-requests/?status=in_progress`;

export const COMPLETE_REQUEST = `${BASE}/request-api/car-requests`;

export const CANCLE_REQUEST = `${BASE}/request-api/car-requests`;

export const GET_CAR_REQUESTS = `${BASE}/request-api/car-requests/pending-requests/`;

export const GET_CURRENT_STATE = `${BASE}/request-api/car-requests/`;
