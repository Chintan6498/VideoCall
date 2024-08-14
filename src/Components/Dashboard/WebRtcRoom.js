import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {RTCView} from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {moderateScale} from '../../Common/styles/Dimensions';
import {color} from '../../Common/styles/theme';
import {screen} from '../../Common/styles/Sizing';

const WebRtcRoom = ({
  localStream,
  remoteStream,
  setType,
  leave,
  setLocalMicOn,
  localMicOn,
  setLocalWebcamOn,
  localWebcamOn,
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {remoteStream && (
        <RTCView
          mirror={localWebcamOn ? false : true}
          streamURL={remoteStream.toURL()}
          style={{
            width: '100%',
            height: '100%',
          }}
          objectFit="contain"
          zOrder={0}
        />
      )}
      {localStream && (
        <RTCView
          mirror={localWebcamOn ? false : true}
          streamURL={localStream.toURL()}
          style={{
            position: 'absolute',
            width: '28%',
            height: '25%',
            borderRadius: moderateScale(20),
            top: 20,
            right: 20,
          }}
          objectFit="contain"
          zOrder={1}
        />
      )}
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            setType('JOIN');
            leave();
            setLocalMicOn(true);
          }}
          style={[styles.button, styles.endCallButton]}>
          <Ionicons
            name="call-outline"
            size={moderateScale(30)}
            color={color.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            localStream.getAudioTracks().forEach(track => {
              track.enabled = !track.enabled;
              setLocalMicOn(!localMicOn);
            });
          }}
          style={styles.button}>
          <Ionicons
            name={localMicOn ? 'mic-outline' : 'mic-off-outline'}
            size={moderateScale(30)}
            color={color.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setLocalWebcamOn(prev => !prev);
            localStream.getVideoTracks().forEach(track => {
              track.enabled = !track.enabled;
            });
          }}
          style={styles.button}>
          <Ionicons
            name={localWebcamOn ? 'videocam-outline' : 'videocam-off-outline'}
            size={moderateScale(30)}
            color={color.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack._switchCamera();
          }}
          style={styles.button}>
          <Ionicons
            name="camera-reverse-outline"
            size={moderateScale(30)}
            color={color.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WebRtcRoom;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 300,
    bottom: 50,
  },
  button: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButton: {
    backgroundColor: 'red',
  },
});
