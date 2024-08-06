import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
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
  callHistory,
  showHistory,
  setShowHistory,
  navigation,
}) => {
  const {setAuth} = useContext(AuthContext);
  const [callList, setCallList] = useState([]);
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
  const toggleHistory = userId => {
    setShowHistory(showHistory === userId ? null : userId);
    const newArray = callHistory.filter(
      calls =>
        calls.callerId._id == userId || calls.receiverId._id == userId,
    );
    setCallList(newArray);
  };
  const renderItem = ({item}, i) => (
    <TouchableOpacity
      activeOpacity={0.8}
      key={item + i}
      onPress={() => toggleHistory(item._id)}
      style={[
        styles.listContainer,
        {backgroundColor: i % 2 !== 0 ? color.listOne : color.listTwo},
      ]}>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
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
                style={[
                  styles.profileImageText,
                  {fontSize: moderateScale(15)},
                ]}>
                {item.firstName && item.firstName.charAt(0).toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.profileImageText,
                  {fontSize: moderateScale(15)},
                ]}>
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
            handleCall(item._id, `${item.firstName} ${item.lastName}`);
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
      {showHistory === item._id && (
        <View style={styles.historyContainer}>
          {callList &&
            callList.slice(0, 1).map((call, index) => (
              <View key={index} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyText}>
                    {call.callerId === userDetails._id
                      ? 'Outgoing'
                      : 'Incoming'}
                    , {call.duration}
                  </Text>
                  <Text style={styles.historyText}>
                    {new Date(call.startTime).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={()=>{navigation.navigate('RecentCallHistory',{callList: callList,callerDetails:item});
                  setShowHistory(showHistory === item._id ? null : item._id);}}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={moderateScale(25)}
                    color={color.black}
                  />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}
    </TouchableOpacity>
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
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(5),
  },
  historyContainer: {
    backgroundColor: color.listOne,
    padding: moderateScale(8),
  },
  historyItem: {
    paddingVertical: 2,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyText: {
    color: color.black,
    fontSize: moderateScale(12),
  },
  noUserContainer: {
    backgroundColor: color.listTwo,
    padding: 8,
    borderRadius: moderateScale(10),
  },
  noUserText: {
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontSize: moderateScale(15),
  },
});
