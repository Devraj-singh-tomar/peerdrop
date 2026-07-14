import { SocketEvents } from "@peerdrop/shared-events";
import { Room, SocketErrorPayload } from "@peerdrop/shared-types";
import { io, Socket } from "socket.io-client";
import { WebRTCService } from "./webrtc.service";

const {
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
  PEER_JOINED,
  SIGNAL_OFFER,
  ERROR,
} = SocketEvents;

export class SocketService {
  // Owns the Socket.IO connection lifecycle.
  private socket: Socket | null = null;
  // Dependency Injection:
  // SocketService does not create WebRTCService.
  private webRtcService: WebRTCService;

  constructor(webRTCService: WebRTCService) {
    this.webRtcService = webRTCService;
  }

  // Connection Lifecycle --------------------------------
  // Responsibility:
  // - Create socket (only once)
  // - Register long-lived listeners

  connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (!this.socket) {
      const serverUrl =
        process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "http://localhost:3001";

      this.socket = io(serverUrl, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket"],
      });

      // Register all long-lived listeners once.
      this.registerSocketListeners();
    }

    const socket = this.socket;

    if (!socket) {
      return Promise.reject(new Error("Socket could not be initialized."));
    }

    return new Promise<void>((resolve, reject) => {
      socket.once("connect", () => {
        console.log("Connected", socket.id);
        resolve();
      });

      socket.once("connect_error", (error) => {
        console.log("Connection failed:", error.message);
        reject(error);
      });

      socket.connect();
    });
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this.socket = null;
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  // Room Lifecycle -------------------------
  async createRoom(): Promise<Room> {
    await this.connect();

    const socket = this.socket;

    if (!socket) {
      throw new Error("Socket connection could not be established.");
    }

    const roomPromise = new Promise<Room>((resolve, reject) => {
      socket.once(ROOM_CREATED, (room: Room) => {
        resolve(room);
      });

      socket.once(ERROR, (error: SocketErrorPayload) => {
        reject(error);
      });
    });

    socket.emit(CREATE_ROOM);

    return roomPromise;
  }

  async joinRoom(roomCode: string): Promise<Room> {
    await this.connect();

    const socket = this.socket;

    if (!socket) {
      throw new Error("Socket connection could not be established.");
    }

    const joinPromise = new Promise<Room>((resolve, reject) => {
      socket.once(ROOM_JOINED, (room: Room) => {
        resolve(room);
      });

      socket.once(ERROR, (error: SocketErrorPayload) => {
        reject(error);
      });
    });

    socket.emit(JOIN_ROOM, { roomCode });

    return joinPromise;
  }

  // Event Lifecycle ------------------------------------
  // Responsibility:
  // Register listeners for server notifications.
  private registerSocketListeners(): void {
    const socket = this.socket;

    if (!socket) {
      throw new Error("Socket connection could not be established.");
    }

    socket.on("disconnect", () => {
      console.log("Disconnect");
    });

    socket.on(PEER_JOINED, async (room: Room) => {
      console.log(room);

      const targetSocketId = room.participants.find((id) => id !== socket.id);

      if (!targetSocketId) {
        throw new Error("Target socket not found");
      }

      const offer = await this.webRtcService.createOffer();

      socket.emit(SIGNAL_OFFER, {
        targetSocketId,
        offer,
      });
    });
  }

  // Signaling Lifecycle -------------------------
}
