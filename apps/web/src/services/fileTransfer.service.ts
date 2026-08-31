import { WebRTCService } from "./webrtc.service";

export class FileTransferService {
  private webRtcService: WebRTCService;

  constructor(webRTCService: WebRTCService) {
    this.webRtcService = webRTCService;

    this.webRtcService.setDataChannelMessageHandler((data) => {
      console.log("[FILE RECEIVED]", data);

      if (data instanceof Blob) {
        console.log("[FILE RECEIVED SIZE]", data.size);
      }
    });
  }

  async sendFile(file: File) {
    const CHUNK_SIZE = 64 * 1024;

    const chunk = file.slice(0, CHUNK_SIZE);

    console.log("[FILE SEND]", {
      name: file.name,
      size: file.size,
    });

    this.webRtcService.send(chunk);

    // const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // for (let i = 0; i < totalChunks; i++) {
    //   const start = i * CHUNK_SIZE;
    //   const end = start + CHUNK_SIZE;

    //   const chunk = file.slice(start, end);

    //   this.webRtcService.send(chunk);

    //   console.log("[FILE]", i + 1, "/", totalChunks);
    // }
  }
}
