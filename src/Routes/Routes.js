import React, {useContext} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../Components/Auth/Login';
import Registration from '../Components/Auth/Registration';
import Dashboard from '../Components/Dashboard/Dashboard';
import {AuthContext} from '../../services/AuthContext';
import RecentCallHistory from '../Components/Dashboard/RecentCallHistory';
const Stack = createNativeStackNavigator();
const authScreens = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        options={{headerShown: false}}
        component={Login}
      />
      <Stack.Screen
        name="Registration"
        options={{headerShown: false}}
        component={Registration}
      />
    </Stack.Navigator>
  );
};
const homeScreens = () => {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen
        name="Dashboard"
        options={{headerShown: false}}
        component={Dashboard}
      />
      <Stack.Screen
        name="RecentCallHistory"
        options={{headerShown: false}}
        component={RecentCallHistory}
      />
    </Stack.Navigator>
  );
};
const Routes = () => {
  const {auth} = useContext(AuthContext);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!auth ? authScreens() : null}
        {auth ? homeScreens() : null}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Routes;
