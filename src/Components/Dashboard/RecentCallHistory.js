import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext} from 'react';
import {color} from '../../Common/styles/theme';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../Common/styles/Dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../../../services/AuthContext';

const RecentCallHistory = ({navigation, route}) => {
  const {callList, callerDetails} = route.params;
  const {auth} = useContext(AuthContext);
  const userDetails = auth.userDetails;

  const convertDateToDDMMM = dateString => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
    });
    return formatter.format(date);
  };

  const groupCallsByDate = calls => {
    return calls.reduce((groups, call) => {
      const date = convertDateToDDMMM(call.startTime);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(call);
      return groups;
    }, {});
  };

  const groupedCalls = groupCallsByDate(callList);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            navigation.goBack();
          }}>
          <Ionicons
            name="chevron-back-outline"
            size={moderateScale(30)}
            color={color.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Recent Call History</Text>
      </View>
      <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={styles.detailContainer}>
          {callerDetails?.profilePicUrl ? (
            <Image
              source={{
                uri: callerDetails?.profilePicUrl,
              }}
              style={{
                height: horizontalScale(80),
                width: horizontalScale(80),
                borderRadius: moderateScale(100),
                marginBottom: verticalScale(10),
                alignSelf: 'center',
              }}
            />
          ) : (
            <View style={styles.mainProfileTextView}>
              <Text
                style={[
                  styles.profileImageText,
                  {fontSize: moderateScale(35)},
                ]}>
                {callerDetails.firstName &&
                  callerDetails.firstName.charAt(0).toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.profileImageText,
                  {fontSize: moderateScale(35)},
                ]}>
                {callerDetails.lastName &&
                  callerDetails.lastName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text
            style={{
              textAlign: 'center',
              color: color.black,
              fontSize: moderateScale(25),
              textTransform: 'capitalize',
            }}>
            {callerDetails.firstName} {callerDetails.lastName}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: color.grey,
              fontSize: moderateScale(20),
              textTransform: 'capitalize',
            }}>
            +91 {callerDetails.mobileNumber}
          </Text>
        </View>
        <View>
          {Object.keys(groupedCalls).map(date => (
            <View key={date} style={{marginHorizontal: 20}}>
              <Text
                style={[
                  styles.historyText,
                  {
                    fontSize: moderateScale(18),
                    fontWeight: 'bold',
                    marginVertical: 10,
                  },
                ]}>
                {date}
              </Text>
              <View style={styles.historyContainer}>
                {groupedCalls[date].map((call, index) => (
                  <View
                    key={index}
                    style={[
                      styles.historyItem,
                      groupedCalls[date].length > 1
                        ? {
                            borderTopLeftRadius: index == 0 ? 10 : 0,
                            borderTopRightRadius: index == 0 ? 10 : 0,
                            borderBottomLeftRadius:
                              index == groupedCalls[date].length > -1 ? 10 : 0,
                            borderBottomRightRadius:
                              index == groupedCalls[date].length > -1 ? 10 : 0,
                              borderBottomColor: color.head,
                              borderBottomWidth:1
                          }
                        : {
                            borderRadius: 10,
                          },
                    ]}>
                    <Text style={styles.historyText}>
                      {new Date(call.startTime).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.historyText}>
                      {call.callerId._id === userDetails._id
                        ? 'Outgoing'
                        : 'Incoming'}
                      ,{' '}
                      {call.duration
                        ? `${Math.floor(call.duration / 60)} mins ${Math.floor(
                            call.duration % 60,
                          )} secs`
                        : 'missed'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecentCallHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.red,
  },
  header: {
    flexDirection: 'row',
    gap: moderateScale(10),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    backgroundColor: color.collapse,
  },
  headerText: {
    color: color.black,
    fontSize: moderateScale(20),
    textTransform: 'capitalize',
  },
  detailContainer: {
    backgroundColor: color.white,
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(20),
    marginHorizontal: horizontalScale(20),
    marginVertical: verticalScale(20),
    borderRadius: moderateScale(10),
  },
  mainProfileTextView: {
    backgroundColor: color.chevron,
    width: horizontalScale(80),
    height: horizontalScale(80),
    borderRadius: moderateScale(100),
    justifyContent: 'center',
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: verticalScale(10),
  },
  profileImageText: {
    color: color.black,
    fontSize: moderateScale(50),
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: color.white,
    padding: 10,
  },
  historyText: {
    color: color.black,
    fontSize: moderateScale(13),
  },
});
