import { GAME_CONFIG, GAME_STATES, PLAYER_ROLES } from '../../../shared/constants.js';
import { Player, ChatMessage } from '../../../shared/types.js';
import { getRandomWords } from '../words.js';

export class GameRoom {
  constructor(roomId, config = {}) {
    this.roomId = roomId;
    this.players = new Map(); // socketId -> Player
    this.hostId = null; // Socket ID of the room host
    this.state = GAME_STATES.WAITING;
    this.currentRound = 0;
    this.currentTurn = 0; // Track which player's turn it is
    this.currentDrawer = null;
    this.currentWord = null;
    this.wordChoices = [];
    this.roundStartTime = null;
    this.roundEndTime = null;
    this.drawingHistory = [];
    this.chatHistory = [];
    this.playerOrder = [];
    this.availableDrawers = []; // Players who haven't drawn yet in current cycle
    this.playersWhoGuessed = new Set();
    this.guessTimestamps = new Map(); // For rate limiting
    this.timerInterval = null;
    
    // Custom configuration
    this.roundTime = config.roundTime || GAME_CONFIG.ROUND_TIME;
    this.totalRounds = config.totalRounds || GAME_CONFIG.TOTAL_ROUNDS;
  }

  addPlayer(socketId, playerName) {
    if (this.players.size >= GAME_CONFIG.MAX_PLAYERS) {
      return { success: false, error: 'Room is full' };
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const player = new Player(playerId, playerName, socketId);
    this.players.set(socketId, player);
    this.playerOrder.push(socketId);

    // If game is in progress, add to available drawers pool (unless they're the host)
    if (this.state !== GAME_STATES.WAITING && socketId !== this.hostId) {
      this.availableDrawers.push(socketId);
    }

    // Set the first player as host
    if (this.players.size === 1) {
      this.hostId = socketId;
    }

    return { success: true, player, isHost: socketId === this.hostId };
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) return;

    const wasHost = socketId === this.hostId;
    const wasDrawer = socketId === this.currentDrawer;

    this.players.delete(socketId);
    this.playerOrder = this.playerOrder.filter(id => id !== socketId);
    this.availableDrawers = this.availableDrawers.filter(id => id !== socketId);
    this.playersWhoGuessed.delete(socketId);

    // Transfer host to next player if host left
    let newHostId = null;
    if (wasHost && this.playerOrder.length > 0) {
      this.hostId = this.playerOrder[0];
      newHostId = this.hostId;
    }

    // If drawer left during their turn (either choosing word or drawing), end round
    if (wasDrawer && (this.state === GAME_STATES.DRAWING || this.state === GAME_STATES.CHOOSING_WORD)) {
      return { shouldEndRound: true, newHostId };
    }

    // If not enough players, reset game
    if (this.players.size < GAME_CONFIG.MIN_PLAYERS && this.state !== GAME_STATES.WAITING) {
      return { shouldResetGame: true, newHostId };
    }

    return { shouldEndRound: false, shouldResetGame: false, newHostId };
  }

  canStartGame() {
    // Need minimum players + 1 (since host doesn't play/draw)
    return this.players.size >= GAME_CONFIG.MIN_PLAYERS + 1 && this.state === GAME_STATES.WAITING;
  }

  startGame() {
    if (!this.canStartGame()) {
      return false;
    }

    this.state = GAME_STATES.CHOOSING_WORD;
    this.currentRound = 1;
    this.currentTurn = 0;
    // Exclude host from drawing - host is observer/moderator
    this.availableDrawers = this.playerOrder.filter(socketId => socketId !== this.hostId);
    this.resetScores();
    this.startNewTurn();
    return true;
  }

  startNewTurn() {
    this.playersWhoGuessed.clear();
    this.drawingHistory = [];
    this.currentWord = null;
    
    // Reset hasGuessed for all players
    this.players.forEach(player => {
      player.hasGuessed = false;
    });

    // If all players have drawn, refresh the available drawers pool (excluding host)
    if (this.availableDrawers.length === 0) {
      this.availableDrawers = this.playerOrder.filter(socketId => socketId !== this.hostId);
    }

    // Randomly select next drawer from available players
    const randomIndex = Math.floor(Math.random() * this.availableDrawers.length);
    this.currentDrawer = this.availableDrawers[randomIndex];
    
    // Remove selected drawer from available pool
    this.availableDrawers.splice(randomIndex, 1);

    // Generate word choices
    this.wordChoices = getRandomWords(GAME_CONFIG.WORD_CHOICES);
    this.state = GAME_STATES.CHOOSING_WORD;
  }

  chooseWord(word) {
    if (!this.wordChoices.includes(word)) {
      return false;
    }

    this.currentWord = word;
    this.state = GAME_STATES.DRAWING;
    this.roundStartTime = Date.now();
    this.roundEndTime = this.roundStartTime + this.roundTime;
    return true;
  }

  endRound() {
    this.state = GAME_STATES.INTERMISSION;
    
    // Award points to drawer based on correct guesses
    const drawer = this.players.get(this.currentDrawer);
    if (drawer) {
      const correctGuesses = this.playersWhoGuessed.size;
      drawer.score += correctGuesses * 50; // 50 points per correct guess
    }

    const roundResults = {
      word: this.currentWord,
      scores: this.getScores(),
      correctGuessers: Array.from(this.playersWhoGuessed).map(socketId => {
        const player = this.players.get(socketId);
        return player ? player.name : 'Unknown';
      })
    };

    return roundResults;
  }

  advanceToNextRound() {
    this.currentRound++;
    
    // Check if we've reached the total number of rounds (each round = one person drawing)
    if (this.currentRound > this.totalRounds) {
      this.endGame();
      return { gameEnded: true };
    }

    this.startNewTurn();
    return { gameEnded: false };
  }

  endGame() {
    this.state = GAME_STATES.ENDED;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetGame() {
    this.state = GAME_STATES.WAITING;
    this.currentRound = 0;
    this.currentTurn = 0;
    this.currentDrawer = null;
    this.currentWord = null;
    this.wordChoices = [];
    this.roundStartTime = null;
    this.roundEndTime = null;
    this.drawingHistory = [];
    this.chatHistory = [];
    this.availableDrawers = [];
    this.playersWhoGuessed.clear();
    this.resetScores();
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetScores() {
    this.players.forEach(player => {
      player.score = 0;
      player.hasGuessed = false;
    });
  }

  processGuess(socketId, guess) {
    const player = this.players.get(socketId);
    if (!player) {
      return { type: 'error', message: 'Player not found' };
    }

    // Check if player is the drawer
    if (socketId === this.currentDrawer) {
      return { type: 'error', message: 'Drawer cannot guess' };
    }

    // Check if player already guessed correctly
    if (this.playersWhoGuessed.has(socketId)) {
      return { type: 'error', message: 'Already guessed correctly' };
    }

    // Rate limiting
    if (!this.checkRateLimit(socketId)) {
      return { type: 'error', message: 'Too many guesses, slow down' };
    }

    const cleanGuess = guess.trim().toLowerCase();
    const cleanWord = this.currentWord.toLowerCase();

    // Exact match
    if (cleanGuess === cleanWord) {
      return this.handleCorrectGuess(socketId, player);
    }

    // Close guess (Levenshtein distance or contains logic)
    if (this.isCloseGuess(cleanGuess, cleanWord)) {
      return { type: 'close', message: 'You\'re close!' };
    }

    return { type: 'incorrect' };
  }

  handleCorrectGuess(socketId, player) {
    this.playersWhoGuessed.add(socketId);
    player.hasGuessed = true;

    // Calculate points based on time remaining
    const timeElapsed = Date.now() - this.roundStartTime;
    const timeRemaining = this.roundTime - timeElapsed;
    const timeRatio = Math.max(0, timeRemaining / this.roundTime);
    const points = Math.floor(GAME_CONFIG.MAX_POINTS * timeRatio);
    
    player.score += points;

    // Check if all players have guessed (excluding drawer and host)
    const eligibleGuessers = this.players.size - 2; // Exclude drawer and host
    const shouldEndRound = this.playersWhoGuessed.size >= eligibleGuessers;

    return {
      type: 'correct',
      points,
      shouldEndRound,
      player: {
        id: player.id,
        name: player.name,
        score: player.score
      }
    };
  }

  isCloseGuess(guess, word) {
    // Check if guess contains most of the word or vice versa
    if (guess.length >= 3 && word.includes(guess)) return true;
    if (word.length >= 3 && guess.includes(word)) return true;

    // Check Levenshtein distance
    const distance = this.levenshteinDistance(guess, word);
    return distance <= 2 && distance < word.length / 2;
  }

  levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  checkRateLimit(socketId) {
    const now = Date.now();
    const timestamps = this.guessTimestamps.get(socketId) || [];
    
    // Remove timestamps older than 1 second
    const recentTimestamps = timestamps.filter(t => now - t < 1000);
    
    if (recentTimestamps.length >= GAME_CONFIG.MAX_GUESSES_PER_SECOND) {
      return false;
    }

    recentTimestamps.push(now);
    this.guessTimestamps.set(socketId, recentTimestamps);
    return true;
  }

  addDrawAction(action) {
    this.drawingHistory.push(action);
    
    // Limit history size to prevent memory issues
    if (this.drawingHistory.length > 10000) {
      this.drawingHistory = this.drawingHistory.slice(-5000);
    }
  }

  clearCanvas() {
    this.drawingHistory = [];
  }

  getTimeRemaining() {
    if (!this.roundEndTime) return 0;
    return Math.max(0, this.roundEndTime - Date.now());
  }

  getGameState() {
    return {
      roomId: this.roomId,
      state: this.state,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      currentDrawer: this.currentDrawer ? this.players.get(this.currentDrawer)?.name : null,
      currentDrawerId: this.currentDrawer,
      hostId: this.hostId,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        hasGuessed: p.hasGuessed,
        isDrawer: p.socketId === this.currentDrawer,
        isHost: p.socketId === this.hostId
      })),
      timeRemaining: this.getTimeRemaining(),
      wordLength: this.currentWord ? this.currentWord.length : 0,
      wordHint: this.getWordHint()
    };
  }

  getWordHint() {
    if (!this.currentWord) return '';
    
    // Show word length with underscores, use | to separate multiple words
    return this.currentWord.split(' ').map(word => 
      word.split('').map(() => '_').join(' ')
    ).join('  |  ');
  }

  getScores() {
    return Array.from(this.players.values())
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score
      }))
      .sort((a, b) => b.score - a.score);
  }

  getPersonalizedLeaderboard(playerId) {
    const allScores = this.getScores();
    const top3 = allScores.slice(0, 3);
    
    // Find player's position
    const playerIndex = allScores.findIndex(p => p.id === playerId);
    
    // If player is in top 3 or there are only 3 or fewer players, return top 3
    if (playerIndex < 3 || allScores.length <= 3) {
      return top3;
    }
    
    // Add player's position with rank
    const playerScore = { ...allScores[playerIndex], rank: playerIndex + 1 };
    return [...top3, playerScore];
  }

  getPlayerBySocketId(socketId) {
    return this.players.get(socketId);
  }

  isDrawer(socketId) {
    return this.currentDrawer === socketId;
  }

  isHost(socketId) {
    return this.hostId === socketId;
  }
}
