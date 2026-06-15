export type RoomStatus = "waiting" | "full";

export interface Room {
  id: string;
  roomCode: string;
  participants: string[];
  status: RoomStatus;
  createdAt: number;
  expiresAt: number;
}

export interface JoinRoomPayload {
  roomCode: string;
}

export interface ParticipantDisconnectResult {
  roomCode: string;
  roomDeleted: boolean;
  room?: Room;
}

export interface PeerLeftPayload {
  participantId: string;
  room: Room;
}

export interface SignalOfferRequest {
  targetSocketId: string;
  offer: RTCSessionDescriptionInit;
}
export interface SignalOfferEvent {
  senderSocketId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SignalAnswerPayload {
  targetSocketId: string;
  answer: RTCSessionDescriptionInit;
}
export interface SignalAnswerReceivedPayload {
  senderSocketId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SignalIceCandidatePayload {
  targetSocketId: string;
  candidate: RTCIceCandidateInit;
}
export interface SignalIceCandidateReceivedPayload {
  senderSocketId: string;
  candidate: RTCIceCandidateInit;
}
