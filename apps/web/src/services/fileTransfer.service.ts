import { WebRTCService } from "./webrtc.service";

export class FileTransferService {
  private WebRtcService: WebRTCService;

  constructor(webRTCService: WebRTCService) {
    this.WebRtcService = webRTCService;
  }

  async sendFile(file: File) {
    const CHUNK_SIZE = 64 * 1024;

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;

      const chunk = file.slice(start, end);

      this.WebRtcService.send(chunk);

      console.log("[FILE]", i + 1, "/", totalChunks);
    }
  }
}
