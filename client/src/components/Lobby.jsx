import { useState } from 'react';
import './Lobby.css';

function Lobby({ onCreateRoom, onJoinRoom, error }) {
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [roundTime, setRoundTime] = useState(80); // seconds
  const [totalRounds, setTotalRounds] = useState(3); // total number of turns

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      return;
    }

    if (mode === 'create') {
      onCreateRoom(playerName.trim(), roundTime, totalRounds);
    } else {
      if (!roomIdInput.trim()) {
        return;
      }
      onJoinRoom(roomIdInput.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-card fade-in">
        <h1 className="lobby-title">🎄 Sketchy Christmas 🎄</h1>
        <p className="lobby-subtitle">🎅 Draw, Guess, and Spread Holiday Cheer! ⛄</p>

        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            className={`mode-btn ${mode === 'join' ? 'active' : ''}`}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lobby-form">
          <div className="form-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              required
            />
          </div>

          {mode === 'join' && (
            <div className="form-group">
              <label htmlFor="roomId">Room Code</label>
              <input
                id="roomId"
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={6}
                required
              />
            </div>
          )}

          {mode === 'create' && (
            <>
              <div className="form-group">
                <label htmlFor="roundTime">Round Time: {roundTime} seconds</label>
                <input
                  id="roundTime"
                  type="range"
                  min="30"
                  max="180"
                  step="10"
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>30s</span>
                  <span>180s</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="totalRounds">Number of Words: {totalRounds}</label>
                <input
                  id="totalRounds"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="submit-btn">
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Lobby;
