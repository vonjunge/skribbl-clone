import { GameRoom } from './GameRoom.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> GameRoom
  }

  createRoom(config = {}) {
    const roomId = this.generateRoomId();
    const room = new GameRoom(roomId, config);
    this.rooms.set(roomId, room);
    return roomId;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  generateRoomId() {
    let roomId;
    do {
      roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    } while (this.rooms.has(roomId));
    return roomId;
  }

  cleanEmptyRooms() {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players.size === 0) {
        this.removeRoom(roomId);
      }
    }
  }
}
