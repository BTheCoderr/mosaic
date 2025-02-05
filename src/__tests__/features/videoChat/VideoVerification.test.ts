import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VideoVerificationScreen from '../../../features/chat/screens/VideoVerificationScreen';
import { videoChatService } from '../../../services/videoChat/videoChatService';
import { chatWebSocket } from '../../../services/websocket/chatWebSocket';

jest.mock('../../../services/videoChat/videoChatService');
jest.mock('../../../services/websocket/chatWebSocket');
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn(),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
  mediaDevices: {
    getUserMedia: jest.fn(),
  },
}));

describe('VideoVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes WebRTC connection successfully', async () => {
    const { getByTestId } = render(<VideoVerificationScreen />);
    
    await waitFor(() => {
      expect(getByTestId('local-stream')).toBeTruthy();
    });
  });

  test('handles connection errors gracefully', async () => {
    // Mock getUserMedia to fail
    require('react-native-webrtc').mediaDevices.getUserMedia.mockRejectedValue(
      new Error('Permission denied')
    );

    const { getByText } = render(<VideoVerificationScreen />);
    
    await waitFor(() => {
      expect(getByText(/Failed to access camera/)).toBeTruthy();
    });
  });

  test('successfully verifies both users', async () => {
    const { getByTestId } = render(<VideoVerificationScreen />);
    
    // Simulate other user joining
    chatWebSocket.emit('videoChat:status', {
      status: 'active',
      participants: ['user1', 'user2'],
    });

    fireEvent.press(getByTestId('verify-button'));
    
    await waitFor(() => {
      expect(videoChatService.verifyUser).toHaveBeenCalled();
    });
  });

  test('handles disconnection and reconnection', async () => {
    const { getByTestId, getByText } = render(<VideoVerificationScreen />);
    
    // Simulate connection loss
    chatWebSocket.emit('disconnect');
    
    await waitFor(() => {
      expect(getByText(/Connection lost/)).toBeTruthy();
    });

    // Simulate reconnection
    chatWebSocket.emit('connect');
    
    await waitFor(() => {
      expect(getByTestId('local-stream')).toBeTruthy();
    });
  });
}); 