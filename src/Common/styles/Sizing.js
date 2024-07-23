import {Dimensions} from 'react-native';

const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

export const screen = {
  width: screenWidth,
  height: screenHeight,
};
