export type RoomStatus = "waiting" | "full";

export interface Room {
  id: string;
  roomCode: string;
  hostSocketId: string;
  guestSocketId?: string;
  status: RoomStatus;
  createdAt: number;
  expiresAt: number;
}
