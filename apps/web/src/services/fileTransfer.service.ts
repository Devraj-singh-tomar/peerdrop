import { FileTransferEvents } from "@peerdrop/shared-events";
import type {
  FileChunkMessage,
  FileEndMessage,
  FileStartMessage,
} from "@peerdrop/shared-types";
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
    const transferId = crypto.randomUUID();
    const CHUNK_SIZE = 64 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const fileStartMessage: FileStartMessage = {
      type: FileTransferEvents.FILE_START,
      transferId,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      totalChunks,
    };

    this.webRtcService.send(JSON.stringify(fileStartMessage));

    for (let i = 0; i < totalChunks; i++) {
      const fileChunkMessage: FileChunkMessage = {
        type: FileTransferEvents.FILE_CHUNK,
        chunkIndex: i,
        transferId,
      };

      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;

      const chunk = file.slice(start, end);

      this.webRtcService.send(JSON.stringify(fileChunkMessage));
      this.webRtcService.send(chunk);

      console.log("[FILE]", i + 1, "/", totalChunks);
    }

    const fileEndMessage: FileEndMessage = {
      type: FileTransferEvents.FILE_END,
      transferId,
    };

    this.webRtcService.send(JSON.stringify(fileEndMessage));
  }
}
