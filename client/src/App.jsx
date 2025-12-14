import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { socketService } from './services/socket';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import { SOCKET_EVENTS } from './shared/constants.js';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleRoomCreated = (data) => {
      setRoomId(data.roomId);
      setCurrentPlayer(data.player);
      setIsHost(data.isHost);
      setGameState(data.gameState);
      setError('');
    };

    const handleRoomJoined = (data) => {
      setRoomId(data.roomId);
      setCurrentPlayer(data.player);
      setIsHost(data.isHost);
      setGameState(data.gameState);
      setError('');
    };

    const handleRoomError = (data) => {
      setError(data.error);
    };

    socketService.on(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);
    socketService.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socketService.on(SOCKET_EVENTS.ROOM_ERROR, handleRoomError);

    return () => {
      socketService.off(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);
      socketService.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socketService.off(SOCKET_EVENTS.ROOM_ERROR, handleRoomError);
    };
  }, []);

  const handleCreateRoom = (playerName, roundTime, totalRounds) => {
    socketService.emit(SOCKET_EVENTS.CREATE_ROOM, { 
      playerName, 
      roundTime, 
      totalRounds 
    });
  };

  const handleJoinRoom = (roomId, playerName) => {
    socketService.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, playerName });
  };

  // If in a room, show game room regardless of route
  if (roomId) {
    return (
      <div className="app">
        <GameRoom
          roomId={roomId}
          currentPlayer={currentPlayer}
          isHost={isHost}
          initialGameState={gameState}
        />
      </div>
    );
  }

  // Otherwise show routing
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              <Lobby
                mode="join"
                onJoinRoom={handleJoinRoom}
                error={error}
              />
            } 
          />
          <Route 
            path="/manager" 
            element={
              <Lobby
                mode="create"
                onCreateRoom={handleCreateRoom}
                error={error}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
