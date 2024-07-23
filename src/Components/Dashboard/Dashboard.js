import {StyleSheet, View} from 'react-native';
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
import {calling} from '../../../services/common.services';
import messaging from '@react-native-firebase/messaging';

const Dashboard = () => {
  const {auth, setAuth} = useContext(AuthContext);
  const userDetails = auth.userDetails;
  const [userList, setUserList] = useState([]);
  const [type, setType] = useState('JOIN');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localMicOn, setLocalMicOn] = useState(true);
  const [localWebcamOn, setLocalWebcamOn] = useState(true);
  const otherUserId = useRef(null);
  const peerConnection = useRef(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
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
  const baseURL = 'http://192.168.1.2:4040';
  // const baseURL =
  //   'https://37e7-2401-4900-1f3f-3858-c850-180-1810-6bb1.ngrok-free.app';
  const socket = SocketIOClient(baseURL, {
    transports: ['websocket'],
    query: {
      callerId,
    },
  });
  useEffect(() => {
    InCallManager.setSpeakerphoneOn(true);
  }, []);
  const setupMediaDevices = () => {
    let isFront = true;

    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind == 'videoinput' &&
          sourceInfo.facing == (isFront ? 'user' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        })
        .then(stream => {
          setLocalStream(stream);
          stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
          });
        })
        .catch(error => {
          console.log('Error getting local stream', error);
        });
    });
  };
  useEffect(() => {
    socket.on('newCall', data => {
      remoteRTCMessage.current = data.rtcMessage;
      otherUserId.current = data.callerId;
      setType('INCOMING_CALL');
    });
    socket.on('callAnswered', data => {
      remoteRTCMessage.current = data.rtcMessage;
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(remoteRTCMessage.current),
      );
      setType('WEBRTC_ROOM');
    });

    socket.on('ICEcandidate', data => {
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
    });
    socket.on('callEnded', data => {
      console.log('Call ended by', data.sender);
      leave(); // Cleanup when receiving callEnded event
    });

    // setup Media Device
    setupMediaDevices();

    peerConnection.current.ontrack = event => {
      // Check if the event.streams array contains a valid MediaStream
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        // If not, create a new MediaStream and add the track to it
        const inboundStream = new MediaStream();
        inboundStream.addTrack(event.track);
        setRemoteStream(inboundStream);
      }
    };

    // Setup ice handling
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

    return () => {
      socket.off('newCall');
      socket.off('callAnswered');
      socket.off('ICEcandidate');
      socket.off('callEnded');
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
  const handleIncomingCall = callerInfo => {
    // Play ringtone
    InCallManager.startRingtone('_DEFAULT_');
    // Show incoming call UI
    // You can use a modal or navigate to a call screen
  };

  useEffect(() => {
    InCallManager.start();
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    return () => {
      InCallManager.stop();
    };
  }, []);

  function sendICEcandidate(data) {
    socket.emit('ICEcandidate', data);
  }
  const processCall = async userId => {
    try {
      const users = {
        userId: userId,
      };
      await calling(users);
      console.log('Call initiated');

      if (!peerConnection.current) {
        throw new Error('PeerConnection is null');
      }
      if (!peerConnection.current) {
        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
          ],
        });
      }

      const sessionDescription = await peerConnection.current.createOffer();

      await peerConnection.current.setLocalDescription(sessionDescription);
      sendCall({
        calleeId: otherUserId.current,
        rtcMessage: sessionDescription,
      });
      setType('OUTGOING_CALL');
    } catch (err) {
      console.error('Error in processCall:', err);
      // Handle the error (e.g., show an error message to the user)
    }
  };
  function sendCall(data) {
    socket.emit('call', data);
  }
  const processAccept = async () => {
    InCallManager.stopRingtone();
    peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(remoteRTCMessage.current),
    );
    const sessionDescription = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(sessionDescription);
    answerCall({
      callerId: otherUserId.current,
      rtcMessage: sessionDescription,
    });
  };
  function answerCall(data) {
    socket.emit('answerCall', data);
  }
  const leave = async () => {
    InCallManager.stopRingtone();
    if (peerConnection.current) {
      peerConnection.current.ontrack = null;
      peerConnection.current.onicecandidate = null;
      peerConnection.current.close();
      peerConnection.current = null;
      // peerConnection.current._unregisterEvents();
      // peerConnection.current.close();
      // peerConnection.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    setRemoteStream(null);
    setLocalStream(null);
    if (otherUserId.current) {
      socket.emit('endCall', {
        calleeId: otherUserId.current,
        callerId: callerId,
      });
    }

    setType('JOIN');
    otherUserId.current = null;
    remoteRTCMessage.current = null;

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    });

    setupMediaDevices();
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
            />
          </View>
        );
      case 'INCOMING_CALL':
        return (
          <IncomingCaller
            processAccept={processAccept}
            leave={leave}
            setType={setType}
          />
        );
      case 'OUTGOING_CALL':
        return <OutgoingCaller leave={leave} setType={setType} />;
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
