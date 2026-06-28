import { io, Socket } from "socket.io-client";

export class SocketService {
  private socket: Socket | null = null;

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
}
