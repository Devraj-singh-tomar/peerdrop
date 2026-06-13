import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

export const createSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
    },
  });

  return io;
};
