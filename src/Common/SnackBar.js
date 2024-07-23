import {ToastAndroid} from 'react-native';

const SnackBar = (message, isError = false) =>
  ToastAndroid.show(message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);

export default SnackBar;
