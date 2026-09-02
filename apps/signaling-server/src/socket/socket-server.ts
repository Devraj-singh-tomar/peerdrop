import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

export const createSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
    },
  });

  return io;
};
