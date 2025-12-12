// Shared type definitions and utility functions

export class Player {
  constructor(id, name, socketId) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.score = 0;
    this.hasGuessed = false;
    this.isConnected = true;
  }
}

export class DrawAction {
  constructor(type, data) {
    this.type = type; // 'draw', 'clear', 'undo'
    this.data = data;
    this.timestamp = Date.now();
  }
}

export class ChatMessage {
  constructor(playerId, playerName, message, isCorrect = false, isSystem = false) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.message = message;
    this.isCorrect = isCorrect;
    this.isSystem = isSystem;
    this.timestamp = Date.now();
  }
}
