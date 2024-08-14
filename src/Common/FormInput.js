import {StyleSheet, Text, TextInput, View} from 'react-native';
import React from 'react';
// import LinearGradient from 'react-native-linear-gradient';
import {color} from './styles/theme';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from './styles/Dimensions';
// import {fontFamily} from './Styles/fonts';

const FormInput = ({
  mainTextView,
  labelStyle,
  textInputStyle,
  label,
  isError = false,
  ...restProps
}) => {
  return (
    <View style={[styles.mainTextView, {...mainTextView}]}>
      <Text style={[styles.labelStyle, {...labelStyle}]}>{label}</Text>
      <View
        style={{
          marginTop: verticalScale(5),
          padding: moderateScale(2),
          borderRadius: moderateScale(5),
          backgroundColor: isError ? color.red : color.primary,
        }}>
        <TextInput
          style={[styles.textInputStyle, {...textInputStyle}]}
          placeholderTextColor={color.chevron}
          {...restProps}
        />
      </View>
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  mainTextView: {
    marginBottom: verticalScale(10),
  },
  labelStyle: {
    // fontFamily: fontFamily.medium,
    fontSize: moderateScale(16),
    color: color.black,
  },
  textInputStyle: {
    borderRadius: moderateScale(5),
    backgroundColor: color.white,
    fontSize: moderateScale(15),
    // fontFamily: fontFamily.regular,
    paddingLeft: horizontalScale(10),
    color: color.black,
    paddingVertical: verticalScale(15),
  },
});
