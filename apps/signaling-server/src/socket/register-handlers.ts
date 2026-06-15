import { type Server } from "socket.io";
import { registerRoomHandlers } from "./room.handlers.js";
import { registerSignalingHandlers } from "./signaling.handlers.js";

export const registerHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    registerRoomHandlers(socket, io);

    registerSignalingHandlers(socket, io);
  });
};
