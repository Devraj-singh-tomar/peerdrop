import type { Room } from "@peerdrop/shared-types";

const roomsStore = new Map<string, Room>();

class RoomRepository {
  saveRoom(room: Room): void {
    roomsStore.set(room.roomCode, room);
  }

  getRoomByCode(roomCode: string): Room | undefined {
    return roomsStore.get(roomCode);
  }

  deleteRoom(roomCode: string): boolean {
    const isDeleted = roomsStore.delete(roomCode);
    return isDeleted;
  }

  updateRoom(room: Room): void {
    roomsStore.set(room.roomCode, room);
  }

  findRoomByParticipantId(participantId: string): Room | undefined {
    for (const room of roomsStore.values()) {
      if (room.participants.includes(participantId)) {
        return room;
      }
    }

    return undefined;
  }
}

export const roomRepository = new RoomRepository();
