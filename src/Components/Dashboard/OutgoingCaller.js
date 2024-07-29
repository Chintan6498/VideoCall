import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../Common/styles/Dimensions';
import {color} from '../../Common/styles/theme';
import {fontFamily} from '../../Common/styles/fonts';

const OutgoingCaller = ({setType, leave, calleeName}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: '#050A0E',
      }}>
      <View
        style={{
          padding: 35,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 14,
        }}>
        <Text
          style={{
            fontFamily: fontFamily.semibold,
            fontSize: moderateScale(22),
            color: '#D0D4DD',
            textTransform: 'capitalize',
          }}>
          {calleeName}
        </Text>
      </View>
      <View
        style={{
          padding: 35,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 14,
        }}>
        <TouchableOpacity
          onPress={() => {
            setType('JOIN');
            leave();
          }}
          style={{
            backgroundColor: 'red',
            padding: 8,
            borderRadius: moderateScale(50),
            justifyContent: 'center',
          }}>
          <Ionicons
            name="call-outline"
            size={moderateScale(30)}
            color={color.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OutgoingCaller;

const styles = StyleSheet.create({});
