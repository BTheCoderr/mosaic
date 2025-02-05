import { MediaStream, RTCPeerConnection } from 'react-native-webrtc';
import CryptoJS from 'crypto-js';

interface VideoQualityConstraints {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

const QUALITY_PRESETS = {
  high: {
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrate: 2500000, // 2.5 Mbps
  },
  medium: {
    width: 854,
    height: 480,
    frameRate: 24,
    bitrate: 1000000, // 1 Mbps
  },
  low: {
    width: 640,
    height: 360,
    frameRate: 20,
    bitrate: 500000, // 500 Kbps
  },
  minimal: {
    width: 320,
    height: 240,
    frameRate: 15,
    bitrate: 250000, // 250 Kbps
  },
};

class VideoQualityService {
  private peerConnection: RTCPeerConnection | null = null;
  private currentQuality: keyof typeof QUALITY_PRESETS = 'high';
  private encryptionKey: string | null = null;

  initialize(pc: RTCPeerConnection) {
    this.peerConnection = pc;
    this.monitorNetworkQuality();
  }

  private monitorNetworkQuality() {
    if (!this.peerConnection) return;

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'failed' || state === 'disconnected') {
        this.adjustQuality('minimal');
      }
    };

    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      if (state === 'disconnected' || state === 'failed') {
        this.adjustQuality('minimal');
      }
    };

    // Monitor stats to adjust quality based on network conditions
    setInterval(() => {
      this.peerConnection?.getStats().then((stats) => {
        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            const rtt = report.currentRoundTripTime;
            const availableBandwidth = report.availableOutgoingBitrate;

            if (rtt > 0.3) {
              // High latency, reduce quality
              this.adjustQuality('low');
            } else if (rtt > 0.15) {
              this.adjustQuality('medium');
            } else if (availableBandwidth > 2500000) {
              this.adjustQuality('high');
            }
          }
        });
      });
    }, 5000);
  }

  async adjustQuality(preset: keyof typeof QUALITY_PRESETS) {
    if (this.currentQuality === preset) return;

    const constraints = QUALITY_PRESETS[preset];
    this.currentQuality = preset;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: constraints.width },
          height: { ideal: constraints.height },
          frameRate: { ideal: constraints.frameRate },
        },
        audio: true,
      });

      // Apply new constraints to existing tracks
      stream.getVideoTracks().forEach((track) => {
        track.applyConstraints({
          width: { ideal: constraints.width },
          height: { ideal: constraints.height },
          frameRate: { ideal: constraints.frameRate },
        });
      });

      return stream;
    } catch (error) {
      console.error('Failed to adjust video quality:', error);
      throw error;
    }
  }

  // Encryption methods
  initializeEncryption(key: string) {
    this.encryptionKey = key;
  }

  encryptData(data: string): string {
    if (!this.encryptionKey) throw new Error('Encryption not initialized');
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  decryptData(encryptedData: string): string {
    if (!this.encryptionKey) throw new Error('Encryption not initialized');
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Video processing methods
  async applyVideoEffect(stream: MediaStream, effect: 'blur' | 'none') {
    // This is a placeholder for video effects implementation
    // In a real app, you would use WebGL or a similar technology to apply effects
    return stream;
  }

  getCurrentQualityStats(): VideoQualityConstraints {
    return QUALITY_PRESETS[this.currentQuality];
  }
}

export const videoQualityService = new VideoQualityService(); 