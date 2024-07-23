import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import {AuthContext} from '../../../services/AuthContext';
import {authRegistration} from '../../../services/common.services';
import {color} from '../../Common/styles/theme';
import {moderateScale, verticalScale} from '../../Common/styles/Dimensions';
import {screen} from '../../Common/styles/Sizing';
import {fontFamily} from '../../Common/styles/fonts';
import FormInput from '../../Common/FormInput';

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
const Registration = ({navigation}) => {
  const {setAuth} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [fmcTokens, setFmcTokens] = useState('');
  const SignupSchema = yup.object().shape({
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email().required(),
    phone: yup
      .string()
      .required()
      .matches(phoneRegExp, 'Mobile Number cannot contain spaces'),
    password: yup
      .string()
      .required()
      .matches(/^\S+$/, 'Password cannot contain spaces'),
  });

  useEffect(() => {
    getFcmToken();
  }, []);

  const getFcmToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    setFmcTokens(fcmToken);
    if (!fcmToken) {
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          setFmcTokens(fcmToken);
          await AsyncStorage.setItem('fcmToken', fcmToken);
        }
      } catch (error) {}
    }
  };
  const {
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    values,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
    },
    validationSchema: SignupSchema,
    onSubmit: values => {
      const postData = {
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        mobileNumber: values?.phone,
        password: values?.password,
        fcmToken: fmcTokens,
      };
      setIsLoading(true);
      authRegistration(postData, true)
        .then(res => {
          setIsLoading(false);
          let authRecord = res?.data;
          setAuth(authRecord);
        })
        .catch(err => {
          resetForm();
          setIsLoading(false);
        });
    },
  });

  const isMobileError = errors.phone && touched.phone;
  const isPasswordError = errors.password && touched.password;
  return (
    <>
      <View style={styles.container}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          <View style={styles.mainContainer}>
            {/* <TouchableOpacity
              activeOpacity={0.8}
              style={{
                borderColor: color.primary,
                borderWidth: 2,
                marginVertical: verticalScale(10),
                height: horizontalScale(100),
                width: horizontalScale(100),
                borderRadius: moderateScale(100),
                backgroundColor: color.listTwo,
                alignSelf: 'center',
              }}></TouchableOpacity> */}

            <FormInput
              label="First Name :"
              placeholder="Enter Your First Name"
              onChangeText={handleChange('first_name')}
              onBlur={handleBlur('first_name')}
              value={values.first_name}
            />
            <FormInput
              label="Last Name :"
              placeholder="Enter Your Last Name"
              onChangeText={handleChange('last_name')}
              onBlur={handleBlur('last_name')}
              value={values.last_name}
            />
            <FormInput
              label="email"
              placeholder="Enter Your email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            <FormInput
              label="Mobile No :"
              placeholder="Enter Your Mobile No."
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              value={values.phone}
              keyboardType="numeric"
              maxLength={10}
            />
            <FormInput
              label="Password :"
              placeholder="Enter Your Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            <TouchableOpacity
              style={styles.loginButtonView}
              activeOpacity={0.8}
              type="submit"
              onPress={handleSubmit}>
              {/* {isLoading ? (
                <ActivityIndicator size={25} color={color.white} />
              ) : (
                <Ionicons
                  name="log-in-outline"
                  size={moderateScale(25)}
                  color={color.white}
                />
              )} */}
              <Text style={styles.loginButtonText}>Registration</Text>
            </TouchableOpacity>
            <Text
              onPress={() => {
                navigation.navigate('Login');
              }}
              style={{
                color: color.black,
                textAlign: 'center',
                marginTop: verticalScale(20),
              }}>
              Already Member ?
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Registration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
    justifyContent: 'center',
  },
  mainContainer: {
    width: screen.width / 1.1,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  loginButtonView: {
    marginTop: verticalScale(15),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: color.primary,
    width: '100%',
    paddingVertical: moderateScale(15),
    borderRadius: moderateScale(5),
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  loginButtonText: {
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontSize: moderateScale(18),
    color: color.white,
  },
});
