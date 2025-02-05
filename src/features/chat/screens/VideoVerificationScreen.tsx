import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RTCPeerConnection, RTCView, mediaDevices } from 'react-native-webrtc';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppSelector } from '../../../store/store';
import { chatWebSocket } from '../../../services/websocket/chatWebSocket';
import Icon from 'react-native-vector-icons/Ionicons';

const configuration = { 
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ]
};

const VideoVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { matchId, userName } = route.params as { matchId: string; userName: string };
  
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const currentUserId = useAppSelector(state => state.auth.user?.id);

  useEffect(() => {
    setupWebRTC();
    return () => {
      cleanupWebRTC();
    };
  }, []);

  const setupWebRTC = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
          width: 640,
          height: 480,
        },
      });

      setLocalStream(stream);

      // Join video chat room
      chatWebSocket.emit('videoChat:join', {
        matchId,
        userId: currentUserId,
      });

      // Listen for WebRTC signaling
      chatWebSocket.on('videoChat:signal', handleSignaling);
      chatWebSocket.on('videoChat:status', handleRoomStatus);
      chatWebSocket.on('videoChat:completed', handleVerificationComplete);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      Alert.alert(
        'Camera Access Required',
        'Please enable camera and microphone access to continue with verification.'
      );
    }
  };

  const setupPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream
    localStream.getTracks().forEach((track: any) => {
      peerConnection.current?.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        chatWebSocket.emit('videoChat:signal', {
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };
  };

  const handleSignaling = async (data: any) => {
    try {
      if (!peerConnection.current) {
        setupPeerConnection();
      }

      if (data.type === 'offer') {
        await peerConnection.current?.setRemoteDescription(data.offer);
        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);
        
        chatWebSocket.emit('videoChat:signal', {
          type: 'answer',
          answer,
        });
      } else if (data.type === 'answer') {
        await peerConnection.current?.setRemoteDescription(data.answer);
      } else if (data.type === 'candidate') {
        await peerConnection.current?.addIceCandidate(data.candidate);
      }
    } catch (err) {
      console.error('Signaling error:', err);
    }
  };

  const handleRoomStatus = (data: { status: string; participants: string[] }) => {
    if (data.status === 'active' && !isCalling) {
      setIsCalling(true);
      initiateCall();
    }
  };

  const initiateCall = async () => {
    try {
      if (!peerConnection.current) {
        setupPeerConnection();
      }

      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);

      chatWebSocket.emit('videoChat:signal', {
        type: 'offer',
        offer,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  const handleVerify = () => {
    Alert.alert(
      'Verify Identity',
      'Do you confirm this person matches their profile?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            chatWebSocket.emit('videoChat:verify');
            setIsVerified(true);
          },
        },
      ]
    );
  };

  const handleVerificationComplete = () => {
    Alert.alert(
      'Verification Complete',
      'You can now start chatting!',
      [
        {
          text: 'Start Chatting',
          onPress: () => navigation.navigate('ChatRoom', { matchId, userName }),
        },
      ]
    );
  };

  const cleanupWebRTC = () => {
    if (localStream) {
      localStream.getTracks().forEach((track: any) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end the call?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            cleanupWebRTC();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.dark }]}>
      {/* Remote Stream (Full Screen) */}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteStream}
          objectFit="cover"
        />
      )}

      {/* Local Stream (Picture in Picture) */}
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localStream}
          objectFit="cover"
        />
      )}

      {/* Loading State */}
      {!isConnected && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.primaryDark }]}>
            {isCalling ? 'Connecting...' : 'Waiting for other person...'}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.status.error }]}
          onPress={handleEndCall}
        >
          <Icon name="call" size={24} color={colors.common.white} />
        </TouchableOpacity>

        {isConnected && !isVerified && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.status.success }]}
            onPress={handleVerify}
          >
            <Icon name="checkmark" size={24} color={colors.common.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  remoteStream: {
    flex: 1,
  },
  localStream: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoVerificationScreen; 