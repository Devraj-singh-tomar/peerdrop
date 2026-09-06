import { FileTransferEvents } from "@peerdrop/shared-events";
import type {
  FileChunkMessage,
  FileEndMessage,
  FileStartMessage,
  FileTransferMessage,
} from "@peerdrop/shared-types";
import { WebRTCService } from "./webrtc.service";

export class FileTransferService {
  private webRtcService: WebRTCService;

  constructor(webRTCService: WebRTCService) {
    this.webRtcService = webRTCService;

    this.webRtcService.setDataChannelMessageHandler((data) => {});
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

    this.sendControlMessage(fileStartMessage);

    for (let i = 0; i < totalChunks; i++) {
      const fileChunkMessage: FileChunkMessage = {
        type: FileTransferEvents.FILE_CHUNK,
        chunkIndex: i,
        transferId,
      };

      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;

      const chunk = file.slice(start, end);

      this.sendControlMessage(fileChunkMessage);

      this.webRtcService.send(chunk);

      console.log(
        `[FILE] Sent chunk ${1 + 1}/${totalChunks} (${chunk.size} bytes)`,
      );
    }

    const fileEndMessage: FileEndMessage = {
      type: FileTransferEvents.FILE_END,
      transferId,
    };

    this.sendControlMessage(fileEndMessage);

    console.log("[FILE] transfer finished", file.name);
  }

  private sendControlMessage(message: FileTransferMessage): void {
    this.webRtcService.send(JSON.stringify(message));
  }
}
