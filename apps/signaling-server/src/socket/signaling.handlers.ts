import { SocketEvents } from "@peerdrop/shared-events";
import {
  SignalAnswerRequest,
  SignalOfferRequest,
} from "@peerdrop/shared-types";
import { type Server, type Socket } from "socket.io";

const { SIGNAL_OFFER, SIGNAL_ANSWER } = SocketEvents;

export const registerSignalingHandlers = (socket: Socket, io: Server) => {
  socket.on(SIGNAL_OFFER, ({ offer, targetSocketId }: SignalOfferRequest) => {
    io.to(targetSocketId).emit(SIGNAL_OFFER, {
      senderSocketId: socket.id,
      offer,
    });
  });

  socket.on(
    SIGNAL_ANSWER,
    ({ answer, targetSocketId }: SignalAnswerRequest) => {
      io.to(targetSocketId).emit(SIGNAL_ANSWER, {
        senderSocketId: socket.id,
        answer,
      });
    },
  );
};
