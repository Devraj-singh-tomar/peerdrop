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
