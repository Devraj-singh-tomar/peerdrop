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
}

export const roomRepository = new RoomRepository();
