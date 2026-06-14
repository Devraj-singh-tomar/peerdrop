import { SocketEvents } from "@peerdrop/shared-events";
import { type Server, type Socket } from "socket.io";
import { createRoom, joinRoom } from "../services/room.service.js";
import { JoinRoomPayload } from "@peerdrop/shared-types";

const {
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
  PEER_JOINED,
  ERROR,
} = SocketEvents;

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

  socket.on(JOIN_ROOM, ({ roomCode }: JoinRoomPayload) => {
    try {
      const room = joinRoom(roomCode, socket.id);

      socket.join(room.roomCode);

      socket.emit(ROOM_JOINED, room);

      socket.to(room.roomCode).emit(PEER_JOINED, room);
    } catch (error) {
      if (error instanceof Error) {
        socket.emit(ERROR, {
          message: error.message,
        });
      }
    }
  });
};
