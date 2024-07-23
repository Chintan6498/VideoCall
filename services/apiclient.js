import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SnackBar from '../src/Common/SnackBar';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Expires: '0',
};
export function apiClient({
  url,
  data,
  method = 'POST',
  headers = {},
  noHeaders,
  message,
  ...rest
}) {
  const getToken = async () => {
    const profileValues = await AsyncStorage.getItem('profileData');
    const profileData = JSON.parse(profileValues);
    return profileData?.token || '';
  };

  return new Promise(async (resolve, reject) => {
    const authToken = await getToken();
    defaultHeaders.Authorization = !authToken ? '' : `Bearer ${authToken}`;
    axios({
      method,
      url,
      headers: {
        ...(noHeaders ? {} : defaultHeaders),
        ...headers,
      },
      data,
      ...rest,
    })
      .then(res => {
        if (message) {
          SnackBar(res?.data?.message);
        }
        resolve(res?.data);
      })
      .catch(err => {
        if (message) {
          message && SnackBar(err.response?.data?.message, true);
        }
        reject(err);
      });
  });
}
