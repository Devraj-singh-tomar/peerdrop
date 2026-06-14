import type { ParticipantDisconnectResult, Room } from "@peerdrop/shared-types";
import {
  ROOM_CODE_LENGTH,
  ROOM_MAX_PARTICIPANTS,
  ROOM_TTL_MS,
} from "../constants/room.constants.js";
import { roomRepository } from "../repositories/room.repository.js";

export const generateRoomCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomCode = "";

  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
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

export const joinRoom = (
  roomCode: string,
  participantSocketId: string,
): Room => {
  const room = roomRepository.getRoomByCode(roomCode);

  if (!room) throw new Error("Room not found, Create one.");

  if (Date.now() > room.expiresAt) throw new Error("This room is expired");
  if (room.participants.length === ROOM_MAX_PARTICIPANTS)
    throw new Error("Room is full!");

  if (room.participants.includes(participantSocketId))
    throw new Error("Participant already joined");

  room.participants.push(participantSocketId);

  room.status = "full";

  roomRepository.updateRoom(room);

  return room;
};

export const handleParticipantDisconnect = (
  participantSocketId: string,
): ParticipantDisconnectResult => {
  const room = roomRepository.findRoomByParticipantId(participantSocketId);

  if (!room) throw new Error("Room not found");

  const updatedParticipants = room.participants.filter(
    (participant) => participant !== participantSocketId,
  );

  if (updatedParticipants.length === 0) {
    const roomDeleted = roomRepository.deleteRoom(room.roomCode);

    return {
      roomCode: room.roomCode,
      roomDeleted,
    };
  }

  room.participants = updatedParticipants;

  room.status =
    updatedParticipants.length >= ROOM_MAX_PARTICIPANTS ? "full" : "waiting";

  roomRepository.updateRoom(room);

  return {
    roomCode: room.roomCode,
    roomDeleted: false,
    room,
  };
};
