const baseURL = 'http://192.168.1.2:4040/api';
// const baseURL =
//   'https://37e7-2401-4900-1f3f-3858-c850-180-1810-6bb1.ngrok-free.app/api';

export const API_URL = {
  // Auth Details
  AUTH_LOGIN: `${baseURL}/auth/login`,
  AUTH_LOGOUT: `${baseURL}/auth/logout`,
  AUTH_REGISTRATION: `${baseURL}/user/signup`,
  USER_LIST: `${baseURL}/user/register/allUsers`,
  CALLING: `${baseURL}/user/call`,
  END_CALLING: `${baseURL}/user/endCall`,
};
