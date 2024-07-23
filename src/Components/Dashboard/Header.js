import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../Common/styles/Dimensions';
import {color} from '../../Common/styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../../../services/AuthContext';
import {
  authLogout,
  getRegisterUserList,
} from '../../../services/common.services';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {fontFamily} from '../../Common/styles/fonts';

const Header = ({
  userDetails,
  userList,
  handleCall,
  setUserList,
  otherUserId,
  setType,
}) => {
  const {setAuth} = useContext(AuthContext);
  useEffect(() => {
    getUserList();
  }, []);
  const getUserList = async () => {
    getRegisterUserList()
      .then(res => {
        const userData = res.data.filter(val => val._id != userDetails._id);
        setUserList(userData);
      })
      .catch(err => {});
  };
  const renderItem = ({item}, i) => (
    <View
      key={item + i}
      style={[
        styles.listContainer,
        {backgroundColor: i % 2 !== 0 ? color.listOne : color.listTwo},
      ]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        {item?.profilePicUrl ? (
          <Image
            source={{
              uri: item?.profilePicUrl,
            }}
            style={{
              height: horizontalScale(30),
              width: horizontalScale(30),
              borderRadius: moderateScale(100),
            }}
          />
        ) : (
          <View style={styles.mainProfileTextView}>
            <Text
              style={[styles.profileImageText, {fontSize: moderateScale(15)}]}>
              {item.firstName && item.firstName.charAt(0).toUpperCase()}
            </Text>
            <Text
              style={[styles.profileImageText, {fontSize: moderateScale(15)}]}>
              {item.lastName && item.lastName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: color.black,
            fontSize: moderateScale(15),
          }}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setType('OUTGOING_CALL');
          handleCall(item._id);
          otherUserId.current = item.mobileNumber;
        }}
        style={{
          backgroundColor: 'skyblue',
          padding: 5,
          borderRadius: moderateScale(50),
        }}>
        <Ionicons
          name="call-outline"
          size={moderateScale(25)}
          color={color.black}
        />
      </TouchableOpacity>
    </View>
  );
  const onLogout = async () => {
    const users = {
      id: userDetails._id,
    };
    authLogout(users, true)
      .then(async res => {
        setAuth(null);
        await AsyncStorage.clear();
      })
      .catch(err => {});
  };
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: verticalScale(10),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}>
          <TouchableOpacity activeOpacity={0.8} style={styles.profile}>
            {userDetails?.profilePicUrl ? (
              <Image
                source={{
                  uri: userDetails?.profilePicUrl,
                }}
                style={{
                  height: horizontalScale(75),
                  width: horizontalScale(75),
                  borderRadius: moderateScale(100),
                }}
              />
            ) : (
              <View
                style={[
                  styles.mainProfileTextView,
                  {height: horizontalScale(75), width: horizontalScale(75)},
                ]}>
                <Text style={styles.profileImageText}>
                  {userDetails.firstName &&
                    userDetails.firstName.charAt(0).toUpperCase()}
                </Text>
                <Text style={styles.profileImageText}>
                  {userDetails.lastName &&
                    userDetails.lastName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text
            style={
              styles.profileText
            }>{`${userDetails.firstName} ${userDetails.lastName}`}</Text>
        </View>
        <TouchableOpacity
          onPress={onLogout}
          style={{
            backgroundColor: color.primary,
            padding: 8,
            borderRadius: moderateScale(50),
            justifyContent: 'center',
          }}>
          <Ionicons
            name="exit-outline"
            size={moderateScale(25)}
            color={color.white}
          />
        </TouchableOpacity>
      </View>
      {userList?.length > 0 ? (
        <FlatList
          data={userList && userList}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
      ) : (
        <View
          style={{
            backgroundColor: color.listTwo,
            padding: 8,
            borderRadius: moderateScale(10),
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: fontFamily.semibold,
              fontSize: moderateScale(15),
            }}>
            No Any User Available
          </Text>
        </View>
      )}
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  profile: {
    height: horizontalScale(80),
    width: horizontalScale(80),
    borderRadius: moderateScale(100),
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: color.primary,
    fontSize: moderateScale(20),
    textTransform: 'capitalize',
    fontFamily: fontFamily.semibold,
  },
  mainProfileTextView: {
    backgroundColor: color.chevron,
    width: horizontalScale(30),
    height: horizontalScale(30),
    borderRadius: moderateScale(100),
    justifyContent: 'center',
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: color.black,
    fontSize: moderateScale(35),
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: color.collapse,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
    justifyContent: 'space-between',
    marginVertical: verticalScale(5),
  },
});
