import type { Room } from "@peerdrop/shared-types";
import { roomRepository } from "../repositories/room.repository.js";

const ROOM_TTL_MS = 30 * 60 * 1000;

export const generateRoomCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomCode = "";
  const codeLength = 6;

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomCode += characters.charAt(randomIndex);
  }

  return roomCode;
};

export const createRoom = (hostSocketId: string): Room => {
  let roomCode = generateRoomCode();
  const createdAt = Date.now();

  let existingRoom = roomRepository.getRoomByCode(roomCode);

  while (existingRoom) {
    roomCode = generateRoomCode();
    existingRoom = roomRepository.getRoomByCode(roomCode);
  }

  const room: Room = {
    id: crypto.randomUUID(),
    roomCode,
    participants: [hostSocketId],
    status: "waiting",
    createdAt,
    expiresAt: createdAt + ROOM_TTL_MS,
  };

  roomRepository.saveRoom(room);

  return room;
};
