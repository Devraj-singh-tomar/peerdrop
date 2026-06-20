export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;

  createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    this.peerConnection.onconnectionstatechange = () => {
      console.log(this.peerConnection?.connectionState);
    };

    return this.peerConnection;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.createPeerConnection();

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    return offer;
  }

  async handleOffer(
    offer: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.createPeerConnection();

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.createPeerConnection();

    await peerConnection.setRemoteDescription(answer);
  }
}
