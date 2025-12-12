import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './game/RoomManager.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json());

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize room manager
const roomManager = new RoomManager();

// Setup socket event handlers
setupSocketHandlers(io, roomManager);

// Clean empty rooms periodically (every 5 minutes)
setInterval(() => {
  roomManager.cleanEmptyRooms();
}, 5 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    rooms: roomManager.rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    roomId: room.roomId,
    players: room.players.size,
    maxPlayers: 36,
    state: room.state
  });
});

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Game server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

export { io, roomManager };
