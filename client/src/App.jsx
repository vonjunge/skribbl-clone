import { useState, useEffect } from 'react';
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

  return (
    <div className="app">
      {!roomId ? (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          error={error}
        />
      ) : (
        <GameRoom
          roomId={roomId}
          currentPlayer={currentPlayer}
          isHost={isHost}
          initialGameState={gameState}
        />
      )}
    </div>
  );
}

export default App;
