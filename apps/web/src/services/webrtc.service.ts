export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;

  createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    this.peerConnection = new RTCPeerConnection();

    return this.peerConnection;
  }
}
