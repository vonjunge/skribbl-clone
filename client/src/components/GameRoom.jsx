import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { SOCKET_EVENTS, GAME_STATES, GAME_CONFIG } from '../shared/constants.js';
import Canvas from './Canvas';
import Chat from './Chat';
import PlayerList from './PlayerList';
import './GameRoom.css';

function GameRoom({ roomId, currentPlayer, isHost: initialIsHost, initialGameState }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [messages, setMessages] = useState([]);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [currentSegments, setCurrentSegments] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWordChoice, setShowWordChoice] = useState(false);
  const [wordChoices, setWordChoices] = useState([]);
  const [roundEndInfo, setRoundEndInfo] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [gameEndInfo, setGameEndInfo] = useState(null);

  const isDrawer = gameState?.currentDrawerId === currentPlayer?.socketId && gameState?.state !== GAME_STATES.ENDED;
  // Check if current player is the host based on game state
  const isHost = gameState?.hostId === currentPlayer?.socketId;

  // Auto-dismiss round end popup
  useEffect(() => {
    if (roundEndInfo) {
      const timer = setTimeout(() => {
        setRoundEndInfo(null);
      }, GAME_CONFIG.INTERMISSION_TIME);

      return () => clearTimeout(timer);
    }
  }, [roundEndInfo]);

  useEffect(() => {
    // Game state updates
    const handleGameStateUpdate = (data) => {
      setGameState(data.gameState);
    };

    const handlePlayerJoined = (data) => {
      setGameState(data.gameState);
      // System message is sent via CHAT_MESSAGE event, no need to add here
    };

    const handlePlayerLeft = (data) => {
      setGameState(data.gameState);
      // System message is sent via CHAT_MESSAGE event, no need to add here
    };

    const handleGameStarted = (data) => {
      setGameState(data.gameState);
      setMessages(prev => [...prev, {
        isSystem: true,
        message: '🎮 Game started! Get ready!'
      }]);
    };

    const handleChooseWord = (data) => {
      setWordChoices(data.words);
      setShowWordChoice(true);
      // Clear canvas for new turn
      setDrawingHistory([]);
      setCurrentSegments([]);
    };

    const handleWordChosen = (data) => {
      setCurrentWord(data.word);
      setShowWordChoice(false);
    };

    const handleRoundStart = (data) => {
      setGameState(data.gameState);
      setDrawingHistory([]);
      setCurrentSegments([]);
      setRoundEndInfo(null);
      setMessages(prev => [...prev, {
        isSystem: true,
        message: `Round ${data.round} - ${data.drawer} is drawing!`
      }]);
    };

    const handleRoundEnd = (data) => {
      setGameState(data.gameState);
      setRoundEndInfo({
        word: data.word,
        scores: data.scores
      });
      setCurrentWord(null);
      setMessages(prev => [...prev, {
        isSystem: true,
        message: `Round ended! The word was: ${data.word}`
      }]);
    };

    const handleGameEnd = (data) => {
      setGameState(data.gameState);
      setGameEndInfo({
        finalScores: data.finalScores
      });
      setCurrentWord(null);
      setShowWordChoice(false);
      setMessages(prev => [...prev, {
        isSystem: true,
        message: '🏁 Game finished! Check the final scores!'
      }]);
    };

    const handleTimerUpdate = (data) => {
      setTimeRemaining(data.timeRemaining);
    };

    // Drawing events
    const handleDraw = (drawData) => {
      if (drawData.type === 'segment') {
        // Real-time segments for viewing only
        setCurrentSegments(prev => [...prev, drawData]);
      } else if (drawData.type === 'stroke') {
        // Complete stroke - add to history and clear segments
        setDrawingHistory(prev => [...prev, drawData]);
        setCurrentSegments([]);
      } else {
        // Other actions (fill, clear, etc.)
        setDrawingHistory(prev => [...prev, drawData]);
      }
    };

    const handleClearCanvas = () => {
      setDrawingHistory([]);
      setCurrentSegments([]);
    };

    const handleUndoEvent = () => {
      setDrawingHistory(prev => prev.slice(0, -1));
    };

    // Chat events
    const handleChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const handleCorrectGuess = (data) => {
      setGameState(prevState => ({
        ...prevState,
        players: prevState.players.map(p =>
          p.id === data.player.id ? { ...p, score: data.player.score, hasGuessed: true } : p
        )
      }));
    };

    const handleCloseGuess = (data) => {
      setMessages(prev => [...prev, {
        isSystem: true,
        message: data.message
      }]);
    };

    // Register all event listeners
    socketService.on(SOCKET_EVENTS.GAME_STATE_UPDATE, handleGameStateUpdate);
    socketService.on(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
    socketService.on(SOCKET_EVENTS.PLAYER_LEFT, handlePlayerLeft);
    socketService.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    socketService.on(SOCKET_EVENTS.CHOOSE_WORD, handleChooseWord);
    socketService.on(SOCKET_EVENTS.WORD_CHOSEN, handleWordChosen);
    socketService.on(SOCKET_EVENTS.ROUND_START, handleRoundStart);
    socketService.on(SOCKET_EVENTS.ROUND_END, handleRoundEnd);
    socketService.on(SOCKET_EVENTS.GAME_END, handleGameEnd);
    socketService.on(SOCKET_EVENTS.TIMER_UPDATE, handleTimerUpdate);
    socketService.on(SOCKET_EVENTS.DRAW, handleDraw);
    socketService.on(SOCKET_EVENTS.CLEAR_CANVAS, handleClearCanvas);
    socketService.on(SOCKET_EVENTS.UNDO, handleUndoEvent);
    socketService.on(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
    socketService.on(SOCKET_EVENTS.CORRECT_GUESS, handleCorrectGuess);
    socketService.on(SOCKET_EVENTS.CLOSE_GUESS, handleCloseGuess);

    return () => {
      socketService.off(SOCKET_EVENTS.GAME_STATE_UPDATE, handleGameStateUpdate);
      socketService.off(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
      socketService.off(SOCKET_EVENTS.PLAYER_LEFT, handlePlayerLeft);
      socketService.off(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
      socketService.off(SOCKET_EVENTS.CHOOSE_WORD, handleChooseWord);
      socketService.off(SOCKET_EVENTS.WORD_CHOSEN, handleWordChosen);
      socketService.off(SOCKET_EVENTS.ROUND_START, handleRoundStart);
      socketService.off(SOCKET_EVENTS.ROUND_END, handleRoundEnd);
      socketService.off(SOCKET_EVENTS.GAME_END, handleGameEnd);
      socketService.off(SOCKET_EVENTS.TIMER_UPDATE, handleTimerUpdate);
      socketService.off(SOCKET_EVENTS.DRAW, handleDraw);
      socketService.off(SOCKET_EVENTS.CLEAR_CANVAS, handleClearCanvas);
      socketService.off(SOCKET_EVENTS.UNDO, handleUndoEvent);
      socketService.off(SOCKET_EVENTS.CHAT_MESSAGE, handleChatMessage);
      socketService.off(SOCKET_EVENTS.CORRECT_GUESS, handleCorrectGuess);
      socketService.off(SOCKET_EVENTS.CLOSE_GUESS, handleCloseGuess);
    };
  }, [currentPlayer]);

  const handleStartGame = () => {
    socketService.emit(SOCKET_EVENTS.START_GAME);
  };

  const handleChooseWord = (word) => {
    socketService.emit(SOCKET_EVENTS.WORD_CHOSEN, { word });
  };

  const handleDraw = (drawData) => {
    // Only add complete strokes and other actions to drawer's history
    // Segments are only for real-time transmission, not for drawer's local history
    if (drawData.type !== 'segment') {
      setDrawingHistory(prev => [...prev, drawData]);
    }
    socketService.emit(SOCKET_EVENTS.DRAW, drawData);
  };

  const handleClear = () => {
    setDrawingHistory([]);
    setCurrentSegments([]);
    socketService.emit(SOCKET_EVENTS.CLEAR_CANVAS);
  };

  const handleUndo = () => {
    setDrawingHistory(prev => prev.slice(0, -1));
    socketService.emit(SOCKET_EVENTS.UNDO);
  };

  const handleSendGuess = (message) => {
    socketService.emit(SOCKET_EVENTS.SEND_GUESS, { message });
  };

  if (!gameState) {
    return <div className="loading">Loading game...</div>;
  }

  return (
    <div className="game-room">
      <div className="game-header">
        <div className="room-info">
          <h2>🎨 Room: {roomId}</h2>
          <p className="room-code">Share this code with friends!</p>
        </div>

        <div className="game-info">
          {gameState.state === GAME_STATES.DRAWING && (
            <>
              <div className="timer">
                ⏱️ <span className={timeRemaining <= 10 ? 'timer-warning' : ''}>{timeRemaining}s</span>
              </div>
              <div className="round-info">
                Round {gameState.currentRound} / {gameState.totalRounds}
              </div>
              <div className="word-hint">
                {gameState.wordHint}
              </div>
            </>
          )}
          {gameState.state === GAME_STATES.WAITING && (
            isHost ? (
              <button onClick={handleStartGame} className="start-game-btn">
                🚀 Start Game
              </button>
            ) : (
              <div className="waiting-notice">
                Waiting for host to start...
              </div>
            )
          )}
          {gameState.state === GAME_STATES.INTERMISSION && (
            <div className="intermission-notice">
              ⏸️ Next round starting soon...
            </div>
          )}
        </div>
      </div>

      <div className="game-content">
        <div className="left-panel">
          <PlayerList
            players={gameState.players}
            currentPlayerId={currentPlayer.id}
          />
        </div>

        <div className="center-panel">
          <Canvas
            isDrawer={isDrawer}
            onDraw={handleDraw}
            onClear={handleClear}
            onUndo={handleUndo}
            drawingHistory={drawingHistory}
            currentSegments={currentSegments}
          />
        </div>

        <div className="right-panel">
          <Chat
            messages={messages}
            onSendGuess={handleSendGuess}
            isDrawer={isDrawer}
            currentWord={currentWord}
          />
        </div>
      </div>

      {showWordChoice && (
        <div className="modal-overlay">
          <div className="word-choice-modal">
            <h2>Choose a word to draw!</h2>
            <div className="word-choices">
              {wordChoices.map((word) => (
                <button
                  key={word}
                  className="word-choice-btn"
                  onClick={() => handleChooseWord(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {roundEndInfo && (
        <div className="modal-overlay">
          <div className="round-end-modal">
            <h2>Round Complete!</h2>
            <p className="revealed-word">The word was: <strong>{roundEndInfo.word}</strong></p>
            <div className="round-scores">
              <h3>Top Scores:</h3>
              {roundEndInfo.scores.slice(0, 5).map((player, index) => (
                <div key={player.id} className="score-item">
                  <span>#{index + 1} {player.name}</span>
                  <span>{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameEndInfo && (
        <div className="modal-overlay game-end-overlay">
          <div className="game-end-modal">
            <h1>🏆 Game Over! 🏆</h1>
            <div className="final-leaderboard">
              <h2>Final Leaderboard</h2>
              {gameEndInfo.finalScores.map((player, index) => {
                const displayRank = player.rank || (index + 1);
                const isTop3 = index < 3 && !player.rank;
                return (
                  <div key={player.id} className={`leaderboard-item rank-${displayRank} ${player.rank ? 'personal-rank' : ''}`}>
                    <div className="rank-badge">
                      {displayRank === 1 && '🥇'}
                      {displayRank === 2 && '🥈'}
                      {displayRank === 3 && '🥉'}
                      {displayRank > 3 && `#${displayRank}`}
                    </div>
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      {player.id === currentPlayer?.id && <span className="you-badge">YOU</span>}
                    </div>
                    <div className="player-score">{player.score} pts</div>
                  </div>
                );
              })}
            </div>
            <button className="play-again-btn" onClick={() => window.location.reload()}>
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameRoom;
