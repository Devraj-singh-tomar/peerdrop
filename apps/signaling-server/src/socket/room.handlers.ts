import { SocketEvents } from "@peerdrop/shared-events";
import { type Socket, type Server } from "socket.io";
import { createRoom } from "../services/room.service.js";

const { CREATE_ROOM, ROOM_CREATED, ERROR } = SocketEvents;

export const registerRoomHandlers = (socket: Socket, io: Server) => {
  socket.on(CREATE_ROOM, () => {
    try {
      const room = createRoom(socket.id);

      socket.join(room.roomCode);

      socket.emit(ROOM_CREATED, room);
    } catch (error) {
      if (error instanceof Error) {
        socket.emit(ERROR, {
          message: error.message,
        });
      }
    }
  });
};
