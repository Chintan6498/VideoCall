import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// function removeEmpty(obj) {
//   return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v));
// }

const AuthContext = createContext();
const AuthProvider = ({children}) => {
  const [auth, setAuthState] = useState(null);
  const getAuthState = async () => {
    try {
      const authData = await AsyncStorage.getItem('profileData');
      setAuthState(JSON.parse(authData));
    } catch (err) {
      setAuthState(null);
    }
  };
  const setAuth = async auth => {
    try {
      if (auth) {
        await AsyncStorage.setItem('profileData', JSON.stringify(auth));
        setAuthState(auth);
      } else {
        setAuthState(null);
      }
    } catch (error) {
      Promise.reject(error);
    }
  };
  useEffect(() => {
    getAuthState();
  }, []);
  return (
    <AuthContext.Provider value={{auth, setAuth}}>
      {children}
    </AuthContext.Provider>
  );
};
export {AuthContext, AuthProvider};
