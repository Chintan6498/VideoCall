import axios from "axios";
import { useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import { Alert } from "react-native";

const AxiosInterceptor = ({ children }) => {
  const {setAuth} = useContext(AuthContext);
  useEffect(() => {
    const resInterceptor = (response) => {
      return response;
    };
    const errInterceptor = (error) => {
      if(error.toJSON().message === 'Network Error'){
        Alert.alert(
          '',
          'Please check your internet connection',
        );
    }
      if (error?.response?.status === 401) {
        AsyncStorage.clear();
        setAuth(null);
      }
      return Promise.reject(error);
    };

    const interceptor = axios.interceptors.response.use(
      resInterceptor,
      errInterceptor
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [setAuth]);
  return children;
};

export default axios;
export { AxiosInterceptor };
