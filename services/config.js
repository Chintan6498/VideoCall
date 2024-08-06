export const baseURL = 'http://192.168.29.21:4040/api';
// export const baseURL =
//   'https://30ac-2401-4900-1f3e-120e-70b0-90af-511d-ee27.ngrok-free.app/api';

export const API_URL = {
  // Auth Details
  AUTH_LOGIN: `${baseURL}/auth/login`,
  AUTH_LOGOUT: `${baseURL}/auth/logout`,
  AUTH_REGISTRATION: `${baseURL}/user/signup`,
  USER_LIST: `${baseURL}/user/register/allUsers`,
  CALLING: `${baseURL}/user/call`,
  END_CALLING: `${baseURL}/user/endCall`,
  CALL_HISTORY:`${baseURL}/user/call-history`,
};
