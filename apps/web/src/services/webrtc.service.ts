export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private onIceCandidateCallback:
    ((candidate: RTCIceCandidate) => void) | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onDataChannelMessageCallback:
    ((data: Blob | ArrayBuffer | string) => void) | null = null;

  // Low threshold for bufferedAmountLowThreshold
  private readonly lowThreshold = 256 * 1024; // 256KB
  // High watermark
  private readonly highWaterMark = 1024 * 1024; // 1MB

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
    dataChannel.binaryType = "blob";

    dataChannel.bufferedAmountLowThreshold = this.lowThreshold;

    dataChannel.onopen = () => {
      console.log("[DATACHANNEL] is open and ready!");
      console.log("[DATACHANNEL]", dataChannel.readyState);
    };

    dataChannel.onmessage = (event) => {
      console.log("[DATACHANNEL] Message received");

      this.onDataChannelMessageCallback?.(event.data);
    };

    dataChannel.onclose = () => {
      console.log("[DATACHANNEL] Data channel is closed!");
    };

    dataChannel.onerror = (event) => {
      console.error("[DATACHANNEL]", event);
    };
  }

  private waitForBufferedAmountLow(dataChannel: RTCDataChannel): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure the DataChannel is open.
      if (dataChannel.readyState !== "open") {
        reject(new Error("DataChannel is not open."));
        return;
      }

      // No need to wait if the buffer is already low.
      if (dataChannel.bufferedAmount <= this.lowThreshold) {
        resolve();
        return;
      }

      let settled = false;

      // Remove all listeners when the promise settles
      const cleanup = () => {
        dataChannel.removeEventListener(
          "bufferedamountlow",
          handleBufferedAmountLow,
        );
        dataChannel.removeEventListener("error", handleError);
        dataChannel.removeEventListener("close", handleClose);
      };

      // Settle the promise only once.
      const finish = (error?: Error) => {
        if (settled) return;

        settled = true;
        cleanup();

        if (error) {
          reject(error);
          return;
        } else {
          resolve();
        }
      };

      //  Handle the buffer becoming low.
      const handleBufferedAmountLow = () => {
        if (dataChannel.readyState !== "open") {
          finish(new Error("DataChannel closed while waiting."));
          return;
        }

        if (dataChannel.bufferedAmount <= this.lowThreshold) {
          finish();
        }
      };

      // Handle channel closure and errors.
      const handleClose = () => {
        finish(new Error("DataChannel closed while waiting."));
      };

      const handleError = () => {
        finish(new Error("DataChannel error while waiting."));
      };

      // Register event listener's
      dataChannel.addEventListener(
        "bufferedamountlow",
        handleBufferedAmountLow,
      );
      dataChannel.addEventListener("close", handleClose);
      dataChannel.addEventListener("error", handleError);

      // Recheck to prevent the race condition.
      if (dataChannel.readyState !== "open") {
        handleClose();
      } else if (dataChannel.bufferedAmount <= this.lowThreshold) {
        handleBufferedAmountLow();
      }
    });
  }

  async send(data: string | Blob | ArrayBuffer): Promise<void> {
    const dataChannel = this.dataChannel;

    if (!dataChannel) {
      throw new Error("DataChannel not ready.");
    }

    if (dataChannel.readyState !== "open") {
      throw new Error("DataChannel is not open.");
    }

    if (dataChannel?.bufferedAmount > this.highWaterMark) {
      console.log(
        "[BACKPRESSURE] Buffer threshold exceeded. Current buffferedAmount: ",
        dataChannel.bufferedAmount,
      );

      console.log(
        "[BACKPRESSURE] Waiting for buffer to drain. Current bufferedAmount: ",
        dataChannel.bufferedAmount,
      );

      await this.waitForBufferedAmountLow(dataChannel);

      console.log(
        "[BACKPRESSURE] Buffer drained, resuming. Current bufferedAmount: ",
        dataChannel.bufferedAmount,
      );
    }

    if (dataChannel.readyState !== "open") {
      throw new Error("DataChannel closed before sending.");
    }

    if (typeof data === "string") {
      dataChannel.send(data);
      return;
    }

    if (data instanceof Blob) {
      dataChannel.send(data);
      return;
    }

    dataChannel.send(data);
  }

  setDataChannelMessageHandler(
    callback: (data: Blob | ArrayBuffer | string) => void,
  ) {
    this.onDataChannelMessageCallback = callback;
  }
}
