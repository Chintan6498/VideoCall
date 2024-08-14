import {Alert, StyleSheet, View} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import IncomingCaller from './IncomingCaller';
import Header from './Header';
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import SocketIOClient from 'socket.io-client';
import InCallManager from 'react-native-incall-manager';
import OutgoingCaller from './OutgoingCaller';
import WebRtcRoom from './WebRtcRoom';
import {color} from '../../Common/styles/theme';
import {screen} from '../../Common/styles/Sizing';
import {AuthContext} from '../../../services/AuthContext';
import {
  addCallRecord,
  calling,
  getCallHistory,
  updateCallRecord,
} from '../../../services/common.services';
import messaging from '@react-native-firebase/messaging';
import {baseURL} from '../../../services/config';

const Dashboard = ({navigation}) => {
  const {auth, setAuth} = useContext(AuthContext);
  const userDetails = auth.userDetails;
  const [userList, setUserList] = useState([]);
  const [type, setType] = useState('JOIN');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localMicOn, setLocalMicOn] = useState(true);
  const [localWebcamOn, setLocalWebcamOn] = useState(true);
  const [callerName, setCallerName] = useState('');
  const [callHistory, setCallHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callId, setCallId] = useState(null);
  const otherUserId = useRef(null);
  const peerConnection = useRef(
    new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19302'},
      ],
    }),
  );
  const callerId = userDetails.mobileNumber;
  let remoteRTCMessage = useRef(null);
  let sessionConstraints = {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
      VoiceActivityDetection: true,
    },
  };
  const url = baseURL.replace(/\/api\/?$/, '');
  const socket = SocketIOClient(url, {
    transports: ['websocket'],
    query: {
      callerId,
    },
  });
  useEffect(() => {
    loadCallHistory(userDetails._id);
  }, []);
  useEffect(() => {
    InCallManager.setSpeakerphoneOn(true);
  }, []);
  useEffect(() => {
    setupSocketListeners();
    setPeerConnection();
    return () => {
      removeSocketListeners();
    };
  }, []);
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data.callerId) {
        handleIncomingCall(remoteMessage.data);
      }
    });
    return unsubscribe;
  }, []);
  const addToCallHistory = async (
    callType,
    otherUserName,
    startTime,
    endTime,
  ) => {
    const duration = endTime - startTime;
    const newCall = {
      callType,
      otherUserName,
      startTime,
      endTime,
      duration,
    };
    console.log(newCall, 'newCall');

    try {
      const caller = await addCallRecord(newCall);
      setCallHistory(prevHistory => [newCall, ...prevHistory]);
    } catch (error) {
      console.error('Error adding call to history:', error);
    }
  };

  const setupMediaDevices = () => {
    return new Promise((resolve, reject) => {
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            frameRate: 30,
            facingMode: 'user',
          },
        })
        .then(stream => {
          stream.getAudioTracks().forEach(track => (track.enabled = true));
          setLocalStream(stream);
          if (peerConnection.current) {
            stream.getTracks().forEach(track => {
              peerConnection.current.addTrack(track, stream);
            });
          }
          resolve();
        })
        .catch(error => {
          console.log('Error getting local stream', error);
          reject(error);
        });
    });
  };
  const createPeerConnection = () => {
    return new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19302'},
      ],
    });
  };

  const setPeerConnection = () => {
    peerConnection.current.ontrack = event => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const inboundStream = new MediaStream();
        inboundStream.addTrack(event.track);
        setRemoteStream(inboundStream);
      }
    };

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        sendICEcandidate({
          calleeId: otherUserId.current,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      } else {
        console.log('End of candidates.');
      }
    };
  };
  const setupSocketListeners = () => {
    socket.on('newCall', handleNewCall);
    socket.on('callAnswered', handleCallAnswered);
    socket.on('ICEcandidate', handleICECandidate);
    socket.on('callEnded', handleCallEnded);
    socket.on('busySignal', handleBusySignal);
    socket.on('callRejected', handleCallRejected);
  };
  const removeSocketListeners = () => {
    socket.off('newCall', handleNewCall);
    socket.off('callAnswered', handleCallAnswered);
    socket.off('ICEcandidate', handleICECandidate);
    socket.off('callEnded', handleCallEnded);
    socket.off('busySignal', handleBusySignal);
    socket.off('callRejected', handleCallRejected);
  };
  const handleBusySignal = data => {
    InCallManager.stopRingtone();
    InCallManager.start({media: 'audio'});
    InCallManager.startRingback();
    setTimeout(() => {
      console.log('Heyyyyyyyy--------yyyyyyy');
      InCallManager.stop();
      setType('JOIN');
      Alert.alert(
        'Call Failed',
        'The person you are trying to reach is busy in Another Call.',
      );
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          localStream.removeTrack(track);
        });
      }
    }, 10000);
  };
  const handleCallRejected = data => {
    console.log('Call Rejected');
    console.log('Call rejected by:', data.calleeId);
    InCallManager.stopRingtone();
    setType('JOIN');
    setCallStatus('rejected');
  };
  const handleNewCall = data => {
    InCallManager.startRingtone('_DEFAULT_');
    remoteRTCMessage.current = data.rtcMessage;
    otherUserId.current = data.callerId;
    setCallerName(data.callerName);
    setType('INCOMING_CALL');
    setCallStartTime(Date.now());
  };

  const handleCallAnswered = async data => {
    remoteRTCMessage.current = data.rtcMessage;
    peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(remoteRTCMessage.current),
    );
    setType('WEBRTC_ROOM');
  };

  const handleICECandidate = async data => {
    let message = data.rtcMessage;
    if (peerConnection.current) {
      peerConnection?.current
        .addIceCandidate(
          new RTCIceCandidate({
            candidate: message.candidate,
            sdpMid: message.id,
            sdpMLineIndex: message.label,
          }),
        )
        .then(data => {
          console.log('SUCCESS');
        })
        .catch(err => {
          console.log('Error', err);
        });
    }
  };

  const handleCallEnded = data => {
    console.log('Call ended by', data.sender);
    leave();
  };

  const handleIncomingCall = callerInfo => {
    InCallManager.startRingtone('_DEFAULT_');
  };

  const startCall = () => {
    InCallManager.start({media: 'video'});
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(true);
  };
  const endCall = async () => {
    InCallManager.stop();
    if (peerConnection.current) {
      peerConnection.current.ontrack = null;
      peerConnection.current.onicecandidate = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
    }
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        localStream.removeTrack(track);
      });
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        track.stop();
        remoteStream.removeTrack(track);
      });
    }
  };
  const rejectCall = () => {
    InCallManager.stopRingtone();
    InCallManager.stop();
    socket.emit('rejectCall', {callerId: otherUserId.current});
    setType('JOIN');
    // setCallStatus('rejected');
  };
  const cutCall = () => {
    InCallManager.stopRingtone();
    InCallManager.stop();
    setType('JOIN');
  };
  function sendICEcandidate(data) {
    socket.emit('ICEcandidate', data);
  }
  const processCall = async (userId, name) => {
    await setupMediaDevices();
    try {
      const users = {
        userId: userId,
      };
      // const callerId = await calling(users);
      // console.log('Call initiated');
      // setCallId(callerId.data.callId);
      if (!peerConnection.current) {
        peerConnection.current = createPeerConnection();
      }
      setCallStartTime(Date.now());
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      sendCall({
        calleeId: otherUserId.current,
        rtcMessage: offer,
      });
      startCall();
      setCallerName(name);
      setType('OUTGOING_CALL');
    } catch (err) {
      console.error('Error in processCall:', err);
    }
  };
  function sendCall(data) {
    socket.emit('call', data);
  }
  const processAccept = async () => {
    InCallManager.stopRingtone();
    InCallManager.stop();
    await setupMediaDevices();
    startCall();
    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(remoteRTCMessage.current),
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      answerCall({
        callerId: otherUserId.current,
        rtcMessage: answer,
      });
      setType('WEBRTC_ROOM');
    } catch (error) {
      console.error('Error in processAccept:', error);
    }
  };
  function answerCall(data) {
    socket.emit('answerCall', data);
  }
  const leave = async () => {
    // setIsInCall(false);
    setCallStartTime(null);

    InCallManager.stopRingtone();
    InCallManager.stop();
    if (otherUserId.current) {
      socket.emit('endCall', {
        calleeId: otherUserId.current,
        callerId: callerId,
      });
    }
    refreshCallHistory();
    endCall();
    setRemoteStream(null);
    setLocalStream(null);
    setLocalMicOn(true);
    setType('JOIN');
    otherUserId.current = null;
    remoteRTCMessage.current = null;
    peerConnection.current = createPeerConnection();
    setPeerConnection();
  };

  const loadCallHistory = async userId => {
    try {
      const history = await getCallHistory(userId);
      setCallHistory(history.data);
    } catch (error) {
      console.error('Error loading call history:', error);
    }
  };
  const refreshCallHistory = () => {
    loadCallHistory(userDetails._id);
  };

  const getScreen = type => {
    switch (type) {
      case 'JOIN':
        return (
          <View style={styles.mainContainer}>
            <Header
              userDetails={userDetails}
              userList={userList}
              setUserList={setUserList}
              handleCall={processCall}
              otherUserId={otherUserId}
              setType={setType}
              callHistory={callHistory}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
              refreshCallHistory={refreshCallHistory}
              navigation={navigation}
            />
          </View>
        );
      case 'INCOMING_CALL':
        return (
          <IncomingCaller
            processAccept={processAccept}
            leave={rejectCall}
            setType={setType}
            callerName={callerName}
          />
        );
      case 'OUTGOING_CALL':
        return (
          <OutgoingCaller
            leave={cutCall}
            setType={setType}
            calleeName={callerName}
          />
        );
      case 'WEBRTC_ROOM':
        return (
          <WebRtcRoom
            localStream={localStream}
            remoteStream={remoteStream}
            setType={setType}
            leave={leave}
            setLocalMicOn={setLocalMicOn}
            localMicOn={localMicOn}
            setLocalWebcamOn={setLocalWebcamOn}
            localWebcamOn={localWebcamOn}
          />
        );
    }
  };
  return <View style={styles.container}>{getScreen(type)}</View>;
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screen.width,
    backgroundColor: color.white,
  },
  mainContainer: {
    flex: 1,
    width: screen.width / 1.1,
    marginRight: 'auto',
    marginLeft: 'auto',
  },
});
