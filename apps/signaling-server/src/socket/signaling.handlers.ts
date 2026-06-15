import { SocketEvents } from "@peerdrop/shared-events";
import { SignalOfferRequest } from "@peerdrop/shared-types";
import { type Server, type Socket } from "socket.io";

const { SIGNAL_OFFER } = SocketEvents;

export const registerSignalingHandlers = (socket: Socket, io: Server) => {
  socket.on(SIGNAL_OFFER, ({ offer, targetSocketId }: SignalOfferRequest) => {
    io.to(targetSocketId).emit(SIGNAL_OFFER, {
      senderSocketId: socket.id,
      offer,
    });
  });
};
