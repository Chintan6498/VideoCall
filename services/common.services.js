import {apiClient} from './apiclient';
import {API_URL} from './config';

// Auth Details
export const authLogin = (data, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.AUTH_LOGIN}`,
      method: 'POST',
      data,
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const authRegistration = (data, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.AUTH_REGISTRATION}`,
      method: 'POST',
      data,
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const getRegisterUserList = (message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.USER_LIST}`,
      method: 'GET',
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const authLogout = (data, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.AUTH_LOGOUT}`,
      method: 'POST',
      data,
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const calling = (data, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.CALLING}`,
      method: 'POST',
      data,
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const endCalling = (data, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.END_CALLING}`,
      method: 'POST',
      data,
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const addCallRecord = (data, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.CALL_HISTORY}`,
      method: 'POST',
      data,
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const getCallHistory = (userId, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.CALL_HISTORY}/${userId}`,
      method: 'GET',
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
export const updateCallRecord = (userId, message = false) => {
  return new Promise((resolve, reject) => {
    apiClient({
      url: `${API_URL.CALL_HISTORY}/${userId}`,
      method: 'PUT',
      message,
    })
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};
