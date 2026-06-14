import { Server } from "socket.io";
import { registerRoomHandlers } from "./room.handlers.js";

export const registerHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    registerRoomHandlers(socket, io);
  });
};
