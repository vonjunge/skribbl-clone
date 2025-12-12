import { SOCKET_EVENTS, GAME_CONFIG, GAME_STATES } from '../../../shared/constants.js';
import { ChatMessage } from '../../../shared/types.js';

export function setupSocketHandlers(io, roomManager) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`✅ Player connected: ${socket.id}`);
    
    let currentRoomId = null;
    let currentRoom = null;

    // Create room
    socket.on(SOCKET_EVENTS.CREATE_ROOM, (data) => {
      const { playerName, roundTime, totalRounds } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { error: 'Player name is required' });
        return;
      }

      // Create room with custom config
      const config = {};
      if (roundTime && roundTime >= 30 && roundTime <= 180) {
        config.roundTime = roundTime * 1000; // Convert to milliseconds
      }
      if (totalRounds && totalRounds >= 1 && totalRounds <= 20) {
        config.totalRounds = totalRounds;
      }

      const roomId = roomManager.createRoom(config);
      const room = roomManager.getRoom(roomId);
      
      const result = room.addPlayer(socket.id, playerName.trim());
      
      if (!result.success) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { error: result.error });
        return;
      }

      currentRoomId = roomId;
      currentRoom = room;
      
      socket.join(roomId);
      socket.emit(SOCKET_EVENTS.ROOM_CREATED, {
        roomId,
        player: result.player,
        isHost: result.isHost,
        gameState: room.getGameState()
      });

      console.log(`🏠 Room created: ${roomId} by ${playerName}`);
    });

    // Join room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (data) => {
      const { roomId, playerName } = data;

      if (!playerName || playerName.trim().length === 0) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { error: 'Player name is required' });
        return;
      }

      const room = roomManager.getRoom(roomId);
      
      if (!room) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { error: 'Room not found' });
        return;
      }

      const result = room.addPlayer(socket.id, playerName.trim());
      
      if (!result.success) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { error: result.error });
        return;
      }

      currentRoomId = roomId;
      currentRoom = room;
      
      socket.join(roomId);
      
      // Notify the joining player
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        roomId,
        player: result.player,
        isHost: result.isHost,
        gameState: room.getGameState(),
        drawingHistory: room.drawingHistory
      });

      // Notify all other players in the room
      socket.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
        player: {
          id: result.player.id,
          name: result.player.name,
          score: result.player.score
        },
        gameState: room.getGameState()
      });

      // Send system message
      const systemMsg = new ChatMessage(
        'system',
        'System',
        `${result.player.name} joined the game`,
        false,
        true
      );
      io.to(roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, systemMsg);

      console.log(`👋 ${playerName} joined room ${roomId}`);
    });

    // Start game
    socket.on(SOCKET_EVENTS.START_GAME, () => {
      if (!currentRoom || !currentRoomId) return;

      // Check if the player is the host
      if (!currentRoom.isHost(socket.id)) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          error: 'Only the room host can start the game'
        });
        return;
      }

      if (!currentRoom.canStartGame()) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          error: `Need at least ${GAME_CONFIG.MIN_PLAYERS} players to start`
        });
        return;
      }

      currentRoom.startGame();
      
      // Notify all players
      io.to(currentRoomId).emit(SOCKET_EVENTS.GAME_STARTED, {
        gameState: currentRoom.getGameState()
      });

      // Send word choices to drawer
      const drawer = currentRoom.getPlayerBySocketId(currentRoom.currentDrawer);
      if (drawer) {
        io.to(currentRoom.currentDrawer).emit(SOCKET_EVENTS.CHOOSE_WORD, {
          words: currentRoom.wordChoices
        });

        // Notify round start
        io.to(currentRoomId).emit(SOCKET_EVENTS.ROUND_START, {
          round: currentRoom.currentRound,
          drawer: drawer.name,
          gameState: currentRoom.getGameState()
        });
      }

      console.log(`🎮 Game started in room ${currentRoomId}`);
    });

    // Word chosen
    socket.on(SOCKET_EVENTS.WORD_CHOSEN, (data) => {
      if (!currentRoom || !currentRoomId) return;
      
      if (!currentRoom.isDrawer(socket.id)) {
        return;
      }

      const { word } = data;
      if (!currentRoom.chooseWord(word)) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { error: 'Invalid word choice' });
        return;
      }

      // Send the actual word only to the drawer
      socket.emit(SOCKET_EVENTS.WORD_CHOSEN, { word });

      // Update game state for all players now that drawing has started
      io.to(currentRoomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, {
        gameState: currentRoom.getGameState()
      });

      // Start timer
      startRoundTimer(currentRoom, currentRoomId, io);

      console.log(`📝 Word chosen in room ${currentRoomId}: ${word}`);
    });

    // Drawing events
    socket.on(SOCKET_EVENTS.DRAW, (drawData) => {
      if (!currentRoom || !currentRoomId) return;
      
      if (!currentRoom.isDrawer(socket.id)) return;
      
      currentRoom.addDrawAction(drawData);
      socket.to(currentRoomId).emit(SOCKET_EVENTS.DRAW, drawData);
    });

    socket.on(SOCKET_EVENTS.CLEAR_CANVAS, () => {
      if (!currentRoom || !currentRoomId) return;
      
      if (!currentRoom.isDrawer(socket.id)) return;
      
      currentRoom.clearCanvas();
      io.to(currentRoomId).emit(SOCKET_EVENTS.CLEAR_CANVAS);
    });

    socket.on(SOCKET_EVENTS.UNDO, () => {
      if (!currentRoom || !currentRoomId) return;
      
      if (!currentRoom.isDrawer(socket.id)) return;

      if (currentRoom.drawingHistory.length > 0) {
        currentRoom.drawingHistory.pop();
        socket.to(currentRoomId).emit(SOCKET_EVENTS.UNDO);
      }
    });

    // Chat and guessing
    socket.on(SOCKET_EVENTS.SEND_GUESS, (data) => {
      if (!currentRoom || !currentRoomId) return;
      
      const { message } = data;
      const player = currentRoom.getPlayerBySocketId(socket.id);
      
      if (!player) return;

      if (currentRoom.state !== GAME_STATES.DRAWING) {
        return;
      }

      const result = currentRoom.processGuess(socket.id, message);

      if (result.type === 'correct') {
        // Notify everyone about correct guess
        io.to(currentRoomId).emit(SOCKET_EVENTS.CORRECT_GUESS, {
          player: result.player,
          points: result.points
        });

        // Send system message
        const correctMsg = new ChatMessage(
          player.id,
          player.name,
          `${player.name} guessed the word! (+${result.points} points)`,
          true,
          true
        );
        io.to(currentRoomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, correctMsg);

        // Update game state
        io.to(currentRoomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, {
          gameState: currentRoom.getGameState()
        });

        // If everyone guessed, end round
        if (result.shouldEndRound) {
          endRound(currentRoom, currentRoomId, io);
        }
      } else if (result.type === 'close') {
        // Send close guess only to the player
        socket.emit(SOCKET_EVENTS.CLOSE_GUESS, { message: result.message });
        
        // Show the guess to everyone but hide it if correct
        const chatMsg = new ChatMessage(player.id, player.name, message);
        io.to(currentRoomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMsg);
      } else if (result.type === 'incorrect') {
        // Broadcast regular chat message
        const chatMsg = new ChatMessage(player.id, player.name, message);
        io.to(currentRoomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatMsg);
      }
    });

    // Disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ Player disconnected: ${socket.id}`);
      
      if (!currentRoom || !currentRoomId) return;

      const player = currentRoom.getPlayerBySocketId(socket.id);
      if (!player) return;

      const result = currentRoom.removePlayer(socket.id);

      // Notify others
      socket.to(currentRoomId).emit(SOCKET_EVENTS.PLAYER_LEFT, {
        playerId: player.id,
        playerName: player.name,
        gameState: currentRoom.getGameState()
      });

      // Notify about new host if host changed
      if (result.newHostId) {
        const newHost = currentRoom.getPlayerBySocketId(result.newHostId);
        if (newHost) {
          const hostMsg = new ChatMessage(
            'system',
            'System',
            `${newHost.name} is now the host`,
            false,
            true
          );
          io.to(currentRoomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, hostMsg);
        }
      }

      const systemMsg = new ChatMessage(
        'system',
        'System',
        `${player.name} left the game`,
        false,
        true
      );
      io.to(currentRoomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, systemMsg);

      if (result.shouldEndRound) {
        endRound(currentRoom, currentRoomId, io);
      } else if (result.shouldResetGame) {
        currentRoom.resetGame();
        io.to(currentRoomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, {
          gameState: currentRoom.getGameState()
        });
      }

      console.log(`👋 ${player.name} left room ${currentRoomId}`);
    });
  });
}

function startRoundTimer(room, roomId, io) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
  }

  room.timerInterval = setInterval(() => {
    const timeRemaining = room.getTimeRemaining();
    
    io.to(roomId).emit(SOCKET_EVENTS.TIMER_UPDATE, {
      timeRemaining: Math.ceil(timeRemaining / 1000)
    });

    if (timeRemaining <= 0) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
      endRound(room, roomId, io);
    }
  }, 1000);
}

function endRound(room, roomId, io) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  const roundResults = room.endRound();
  
  io.to(roomId).emit(SOCKET_EVENTS.ROUND_END, {
    word: roundResults.word,
    scores: roundResults.scores,
    gameState: room.getGameState()
  });

  // Wait for intermission, then start next round or end game
  setTimeout(() => {
    const result = room.advanceToNextRound();
    
    if (result.gameEnded) {
      // Send personalized leaderboards to each player
      room.players.forEach((player) => {
        const personalizedScores = room.getPersonalizedLeaderboard(player.id);
        io.to(player.socketId).emit(SOCKET_EVENTS.GAME_END, {
          finalScores: personalizedScores,
          gameState: room.getGameState()
        });
      });
      console.log(`🏁 Game ended in room ${roomId}`);
    } else {
      // Clear canvas for new turn
      io.to(roomId).emit(SOCKET_EVENTS.CLEAR_CANVAS);
      
      // Send word choices to new drawer
      const drawer = room.getPlayerBySocketId(room.currentDrawer);
      if (drawer) {
        io.to(room.currentDrawer).emit(SOCKET_EVENTS.CHOOSE_WORD, {
          words: room.wordChoices
        });

        // Notify round start
        io.to(roomId).emit(SOCKET_EVENTS.ROUND_START, {
          round: room.currentRound,
          drawer: drawer.name,
          gameState: room.getGameState()
        });
      }

      io.to(roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, {
        gameState: room.getGameState()
      });
    }
  }, GAME_CONFIG.INTERMISSION_TIME);
}
