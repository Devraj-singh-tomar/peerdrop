import { FileTransferEvents } from "@peerdrop/shared-events";
import type {
  FileChunkMessage,
  FileEndMessage,
  FileStartMessage,
  FileTransferMessage,
} from "@peerdrop/shared-types";
import { WebRTCService } from "./webrtc.service";

interface IncomingTransfer {
  transferId: string;
  fileName: string;
  mimeType: string;
  size: number;
  totalChunks: number;
  receivedChunks: Array<Blob | undefined>;
}

export class FileTransferService {
  private webRtcService: WebRTCService;

  private incomingTransfer: IncomingTransfer | null = null;
  private pendingChunkIndex: number | null = null;

  constructor(webRTCService: WebRTCService) {
    this.webRtcService = webRTCService;

    this.webRtcService.setDataChannelMessageHandler((data) => {
      this.handleIncomingData(data);
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

  private handleIncomingData(data: ArrayBuffer | Blob | string): void {
    if (typeof data === "string") {
      this.handleControlMessage(data);
      return;
    }

    if (data instanceof Blob) {
      this.handleBinaryChunk(data);
      return;
    }

    if (data instanceof ArrayBuffer) {
      const blob = new Blob([data]);
      this.handleBinaryChunk(blob);
      return;
    }

    console.warn("[FILE] Unsupported incoming data", data);
  }

  private handleControlMessage(data: string): void {
    let message: FileTransferMessage;

    try {
      message = JSON.parse(data) as FileTransferMessage;
    } catch (error) {
      console.error("[FILE] Invalid control message:", error);
      return;
    }

    switch (message.type) {
      case FileTransferEvents.FILE_START:
        this.handleFileStart(message);
        break;
      case FileTransferEvents.FILE_CHUNK:
        this.handleFileChunk(message);
        break;
      case FileTransferEvents.FILE_END:
        this.handleFileEnd(message);
        break;

      default:
        console.warn("[FILE] Unknown file message", message);
    }
  }

  private handleFileStart(message: FileStartMessage): void {
    console.log("[FILE] Receiving file:", message.fileName);

    if (this.incomingTransfer) {
      console.warn("[FILE] Existing transfer will be replaced.");
    }

    this.incomingTransfer = {
      fileName: message.fileName,
      mimeType: message.mimeType,
      size: message.size,
      totalChunks: message.totalChunks,
      transferId: message.transferId,
      receivedChunks: new Array(message.totalChunks),
    };

    this.pendingChunkIndex = null;

    console.log("[FILE] Incoming transfer initialized:", {
      transferId: message.transferId,
      fileName: message.fileName,
      size: message.size,
      totalChunks: message.totalChunks,
    });
  }

  private handleFileChunk(message: FileChunkMessage): void {
    const transfer = this.incomingTransfer;

    if (!transfer) {
      console.error("[FILE] Received chunk without FILE_START.");
      return;
    }

    if (message.transferId !== transfer.transferId) {
      console.error("[FILE] Chunk belongs to another transfer.");
      return;
    }

    if (message.chunkIndex < 0 || message.chunkIndex >= transfer.totalChunks) {
      console.error("[FILE] Invalid chunk index:", message.chunkIndex);
      return;
    }

    if (this.pendingChunkIndex !== null) {
      console.error(
        "[FILE] Received new chunk metadata before previous binary chunk.",
      );
      return;
    }

    this.pendingChunkIndex = message.chunkIndex;

    console.log(
      `[FILE] Expecting chunk ${message.chunkIndex + 1}/${transfer.totalChunks}`,
    );
  }

  private handleBinaryChunk(data: Blob): void {
    const transfer = this.incomingTransfer;

    if (!transfer) {
      console.error("[FILE] Received binary data without FILE_START.");
      return;
    }

    if (this.pendingChunkIndex === null) {
      console.error("[FILE] Received binary data without FILE_CHUNK.");
      return;
    }

    const chunkIndex = this.pendingChunkIndex;

    if (transfer.receivedChunks[chunkIndex]) {
      console.error("[FILE] Duplicate chunk:", chunkIndex);

      this.pendingChunkIndex = null;
      return;
    }

    transfer.receivedChunks[chunkIndex] = data;

    this.pendingChunkIndex = null;

    console.log(
      `[FILE] Received chunk ${chunkIndex + 1}/${transfer.totalChunks} (${data.size} bytes)`,
    );
  }

  private handleFileEnd(message: FileEndMessage): void {
    const transfer = this.incomingTransfer;

    if (!transfer) {
      console.error("[FILE] Received FILE_END without FILE_START.");
      return;
    }

    if (message.transferId !== transfer.transferId) {
      console.error("[FILE] FILE_END belongs to another transfer.");
      return;
    }

    if (this.pendingChunkIndex !== null) {
      console.error("[FILE] FILE_END received while waiting for binary chunk.");
      return;
    }

    const missingChunkIndex = transfer.receivedChunks.findIndex(
      (chunk) => chunk === undefined,
    );

    if (missingChunkIndex !== -1) {
      console.error(
        `[FILE] Transfer incomplete. Missing chunk ${missingChunkIndex}`,
      );
      return;
    }

    const chunks = transfer.receivedChunks as Blob[];

    const receivedSize = chunks.reduce((total, chunk) => total + chunk.size, 0);

    if (receivedSize !== transfer.size) {
      console.error("[FILE] Size mismatch:", {
        expected: transfer.size,
        received: receivedSize,
      });

      return;
    }

    const fileBlob = new Blob(chunks, {
      type: transfer.mimeType,
    });

    console.log("[FILE] File successfully reconstructed:", {
      fileName: transfer.fileName,
      size: fileBlob.size,
      type: fileBlob.type,
    });

    this.incomingTransfer = null;
    this.pendingChunkIndex = null;
  }
}
