export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private onIceCandidateCallback:
    | ((candidate: RTCIceCandidate) => void)
    | null = null;
  private dataChannel: RTCDataChannel | null = null;

  createPeerConnection(): RTCPeerConnection {
    // Lazy Initialization -------------------------
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

    console.log("[WEBRTC] PeerConnection Created");

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;

      this.registerDataChannelListeners(event.channel);

      console.log("[DATACHANNEL] Received");
    };

    this.peerConnection.onicecandidate = (event) => {
      console.log("[WEBRTC] ICE Found");

      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log("[WEBRTC]", this.peerConnection?.connectionState);
    };

    return this.peerConnection;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.createPeerConnection();

    this.createDataChannel();

    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    console.log("[WEBRTC] createOffer");

    return offer;
  }

  async handleOffer(
    offer: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.createPeerConnection();

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    console.log("[WEBRTC] handleOffer");

    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.createPeerConnection();

    await peerConnection.setRemoteDescription(answer);

    console.log("[WEBRTC] handleAnswer");
  }

  setIceCandidateHandler(callback: (candidate: RTCIceCandidate) => void) {
    this.onIceCandidateCallback = callback;
  }

  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.createPeerConnection();

    console.log("[WEBRTC] addIceCandidate");

    return peerConnection.addIceCandidate(candidate);
  }

  createDataChannel() {
    const peerConnection = this.createPeerConnection();

    const dataChannel = peerConnection.createDataChannel("file-transfer");

    this.dataChannel = dataChannel;

    this.registerDataChannelListeners(dataChannel);

    console.log("[DATACHANNEL] Created");
  }

  private registerDataChannelListeners(dataChannel: RTCDataChannel) {
    dataChannel.onopen = (event) => {
      console.log("Data channel is open and ready!");
      console.log("[DATACHANNEL]", dataChannel.readyState);

      dataChannel.send("Hello PeerDrop!");
    };

    dataChannel.onmessage = (event) => {
      console.log("Message received:", event.data);
      console.log("Message received size:", event.data.size);
    };

    dataChannel.onclose = (event) => {
      console.log("Data channel is closed!");
    };

    dataChannel.onerror = (event) => {
      console.error("[DATACHANNEL]", event);
    };
  }

  send(data: string | Blob | ArrayBuffer): void {
    if (!this.dataChannel) {
      throw new Error("DataChannel not ready.");
    }

    if (this.dataChannel.readyState !== "open") {
      throw new Error("DataChannel not open.");
    }

    if (typeof data === "string") {
      this.dataChannel.send(data);
      return;
    }

    if (data instanceof Blob) {
      this.dataChannel.send(data);
      return;
    }

    this.dataChannel.send(data);
  }
}
