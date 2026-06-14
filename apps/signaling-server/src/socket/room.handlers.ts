import { SocketEvents } from "@peerdrop/shared-events";
import { JoinRoomPayload } from "@peerdrop/shared-types";
import { type Server, type Socket } from "socket.io";
import {
  createRoom,
  handleParticipantDisconnect,
  joinRoom,
} from "../services/room.service.js";

const {
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
  PEER_JOINED,
  ERROR,
  PEER_LEFT,
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

  socket.on("disconnect", () => {
    try {
      const handleParticipants = handleParticipantDisconnect(socket.id);

      if (handleParticipants.roomDeleted) return;

      socket.to(handleParticipants.roomCode).emit(PEER_LEFT, {
        participantId: socket.id,
        room: handleParticipants.room,
      });
    } catch (error) {
      console.log(error);
    }
  });
};
