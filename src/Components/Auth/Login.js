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
import FormInput from '../../Common/FormInput';
import {AuthContext} from '../../../services/AuthContext';
import {screen} from '../../Common/styles/Sizing';
import {color} from '../../Common/styles/theme';
import {moderateScale, verticalScale} from '../../Common/styles/Dimensions';
import {fontFamily} from '../../Common/styles/fonts';
import {authLogin} from '../../../services/common.services';

const Login = ({navigation}) => {
  const {setAuth} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [fmcTokens, setFmcTokens] = useState('');
  const SignupSchema = yup.object().shape({
    email: yup.string().email().required(),
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
      email: '',
      password: '',
    },
    validationSchema: SignupSchema,
    onSubmit: values => {
      const postData = {
        email: values?.email,
        password: values?.password,
        // socketId: socket.id,
        fcmToken: fmcTokens,
      };
      setIsLoading(true);
      authLogin(postData, true)
        .then(res => {
          setIsLoading(false);
          let authRecord = res?.data;
          setAuth(authRecord);
          // socket.emit('register', response.data._id);
        })
        .catch(err => {
          resetForm();
          setIsLoading(false);
        });
    },
  });

  const isPasswordError = errors.password && touched.password;
  return (
    <>
      <View style={styles.container}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          <View style={styles.mainContainer}>
            <FormInput
              label="email"
              placeholder="Enter Your email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
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
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <Text
              onPress={() => {
                navigation.navigate('Registration');
              }}
              style={{
                color: color.black,
                textAlign: 'center',
                marginTop: verticalScale(20),
              }}>
              Don't have an account ?
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Login;

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
