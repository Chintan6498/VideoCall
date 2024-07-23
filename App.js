import React, {useEffect} from 'react';
import {PermissionsAndroid, Platform, Text} from 'react-native';
import {AuthProvider} from './services/AuthContext';
import {AxiosInterceptor} from './services/AxiosInterseptor';
import Routes from './src/Routes/Routes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Ionicons.loadFont().catch(error => {
  console.info(error);
});
const requestUserPermission = async () => {
  await messaging().requestPermission();
};
const App = () => {
  useEffect(() => {
    if (Platform.OS == 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      )
        .then(res => {
          if (!!res && res == 'granted') {
            requestUserPermission();
          }
        })
        .catch(err => {});
    } else {
    }
  }, []);

  useEffect(() => {
    PushNotification.createChannel(
      {
        channelId: 'videoCall', // (required)
        channelName: 'video call channel', // (required)
        channelDescription: 'A channel to show your notifications', // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        channelId: 'videoCallApp',
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
        playSound: true,
        soundName: 'default',
        importance: 'high',
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Platform.OS == 'ios' && IOSPermission();
    Platform.OS == 'android' && AndroidPermission();
  }, []);
  const IOSPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  };
  const AndroidPermission = () => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  };
  return (
    <AuthProvider>
      <AxiosInterceptor>
        <Routes />
      </AxiosInterceptor>
    </AuthProvider>
  );
};

export default App;
