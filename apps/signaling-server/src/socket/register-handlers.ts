import { Server, type Socket } from "socket.io";

export const registerHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("client Connected", socket.id);
  });
};
