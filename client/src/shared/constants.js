// Shared constants between client and server

export const GAME_CONFIG = {
  MAX_PLAYERS: 36,
  MIN_PLAYERS: 3,
  ROUND_TIME: 80000, // 80 seconds in milliseconds
  INTERMISSION_TIME: 7000, // 7 seconds
  TOTAL_ROUNDS: 8,
  MAX_POINTS: 1000,
  WORD_CHOICES: 3,
  MAX_GUESSES_PER_SECOND: 3,
  UNDO_HISTORY_SIZE: 10
};

export const GAME_STATES = {
  WAITING: 'waiting',
  CHOOSING_WORD: 'choosing_word',
  DRAWING: 'drawing',
  INTERMISSION: 'intermission',
  ENDED: 'ended'
};

export const PLAYER_ROLES = {
  DRAWER: 'drawer',
  GUESSER: 'guesser'
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Room management
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  ROOM_ERROR: 'room_error',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  
  // Game flow
  START_GAME: 'start_game',
  GAME_STARTED: 'game_started',
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  GAME_END: 'game_end',
  CHOOSE_WORD: 'choose_word',
  WORD_CHOSEN: 'word_chosen',
  
  // Drawing
  DRAW: 'draw',
  CLEAR_CANVAS: 'clear_canvas',
  UNDO: 'undo',
  
  // Chat and guessing
  SEND_GUESS: 'send_guess',
  CHAT_MESSAGE: 'chat_message',
  CORRECT_GUESS: 'correct_guess',
  CLOSE_GUESS: 'close_guess',
  
  // State updates
  GAME_STATE_UPDATE: 'game_state_update',
  TIMER_UPDATE: 'timer_update',
  SCORE_UPDATE: 'score_update'
};

export const DRAWING_TOOLS = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  BUCKET: 'bucket'
};

export const BRUSH_SIZES = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 5
};

export const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#4B0082',
  '#8B4513', '#00FF7F', '#DC143C', '#00CED1', '#FF1493',
  '#32CD32', '#FF6347', '#4169E1', '#FF8C00', '#9370DB'
];
