import { SocketEvents } from "@peerdrop/shared-events";
import { Room } from "@peerdrop/shared-types";
import { io, Socket } from "socket.io-client";

const { CREATE_ROOM, ROOM_CREATED } = SocketEvents;

export class SocketService {
  private socket: Socket | null = null;

  // Connection Lifecycle --------------------
  connect(): void {
    if (this.socket) return;

    const serverUrl =
      process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "http://localhost:3001";

    const socket: Socket = io(serverUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });

    this.socket = socket;

    socket.on("connect", () => {
      console.log("Connected", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnect");
    });

    socket.on("connect_error", (error) => {
      console.log("Connection Failed", error.message);
    });

    socket.connect();
  }

  disconnect() {}

  isConnected() {}

  // Room Lifecycle -------------------------
  async createRoom(): Promise<Room> {
    if (!this.socket) {
      this.connect();
    }

    const socket = this.socket;

    if (!socket) {
      throw new Error("Socket connection could not be established.");
    }

    const roomPromise = new Promise<Room>((resolve) => {
      socket.once(ROOM_CREATED, (room: Room) => {
        resolve(room);
      });
    });

    socket.emit(CREATE_ROOM);

    return roomPromise;
  }

  // Signaling Lifecycle -------------------------
}
