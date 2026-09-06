export interface FileStartMessage {
  type: "file-start";
  transferId: string;
  fileName: string;
  mimeType: string;
  size: number;
  totalChunks: number;
}

export interface FileChunkMessage {
  type: "file-chunk";
  transferId: string;
  chunkIndex: number;
}

export interface FileEndMessage {
  type: "file-end";
  transferId: string;
}

export type FileTransferMessage =
  FileStartMessage | FileChunkMessage | FileEndMessage;
