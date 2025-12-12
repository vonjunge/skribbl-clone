# API Documentation

## Server Endpoints

### HTTP Endpoints

#### GET /health
Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "healthy",
  "rooms": 0,
  "timestamp": "2025-11-27T10:30:00.000Z"
}
```

#### GET /room/:roomId
Get information about a specific room.

**Parameters:**
- `roomId` (string): The 6-character room code

**Response (Success):**
```json
{
  "roomId": "ABC123",
  "players": 5,
  "maxPlayers": 36,
  "state": "drawing"
}
```

**Response (Error):**
```json
{
  "error": "Room not found"
}
```
Status: 404

---

## WebSocket Events

### Client → Server Events

#### CREATE_ROOM
Create a new game room.

**Payload:**
```javascript
{
  playerName: string // Max 20 characters
}
```

**Response:** `ROOM_CREATED` or `ROOM_ERROR`

---

#### JOIN_ROOM
Join an existing room.

**Payload:**
```javascript
{
  roomId: string,    // 6-character code
  playerName: string // Max 20 characters
}
```

**Response:** `ROOM_JOINED` or `ROOM_ERROR`

---

#### START_GAME
Start the game (host only).

**Payload:** None

**Requirements:**
- Must be room host
- Minimum 3 players
- Game state must be 'waiting'

**Response:** `GAME_STARTED` broadcasted to room

---

#### WORD_CHOSEN
Drawer selects a word.

**Payload:**
```javascript
{
  word: string // Must be one of the provided word choices
}
```

**Response:** `WORD_CHOSEN` and `ROUND_START` broadcasted

---

#### DRAW
Send drawing data.

**Payload (Segment - Real-time):**
```javascript
{
  type: 'segment',
  data: {
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,   // Hex color
    size: number,    // 1-100
    tool: string     // 'pencil' | 'eraser'
  }
}
```

**Payload (Stroke - Complete):**
```javascript
{
  type: 'stroke',
  data: {
    points: Array<{x: number, y: number}>,
    color: string,
    size: number,
    tool: string
  }
}
```

**Payload (Fill):**
```javascript
{
  type: 'fill',
  data: {
    x: number,
    y: number,
    color: string
  }
}
```

**Broadcast:** `DRAW` to all other players in room

---

#### CLEAR_CANVAS
Clear the canvas (drawer only).

**Payload:** None

**Broadcast:** `CLEAR_CANVAS` to all players in room

---

#### UNDO
Undo last drawing action (drawer only).

**Payload:** None

**Broadcast:** `UNDO` to all other players in room

---

#### SEND_GUESS
Submit a guess.

**Payload:**
```javascript
{
  guess: string
}
```

**Rate Limit:** 3 guesses per second

**Responses:**
- `CORRECT_GUESS` - if guess is correct
- `CLOSE_GUESS` - if guess is close (Levenshtein distance)
- `CHAT_MESSAGE` - regular chat message if incorrect

---

#### DISCONNECT
Player disconnects from room.

**Automatic:** Triggered by browser close/navigation

**Broadcast:** `PLAYER_LEFT` to remaining players

---

### Server → Client Events

#### ROOM_CREATED
Room successfully created.

**Payload:**
```javascript
{
  roomId: string,
  gameState: GameState
}
```

---

#### ROOM_JOINED
Successfully joined room.

**Payload:**
```javascript
{
  roomId: string,
  gameState: GameState
}
```

---

#### ROOM_ERROR
Error creating/joining room.

**Payload:**
```javascript
{
  message: string
}
```

---

#### PLAYER_JOINED
A player joined the room.

**Payload:**
```javascript
{
  player: {
    id: string,
    socketId: string,
    name: string,
    score: number
  },
  gameState: GameState
}
```

---

#### PLAYER_LEFT
A player left the room.

**Payload:**
```javascript
{
  playerId: string,
  playerName: string,
  gameState: GameState
}
```

---

#### GAME_STARTED
Game has started.

**Payload:**
```javascript
{
  gameState: GameState
}
```

---

#### CHOOSE_WORD
Sent to drawer with word choices.

**Payload:**
```javascript
{
  words: string[] // Array of 3 words
}
```

---

#### WORD_CHOSEN
Word has been chosen by drawer.

**Payload:**
```javascript
{
  word: string // Full word for drawer, masked for others
}
```

---

#### ROUND_START
New round has started.

**Payload:**
```javascript
{
  round: number,
  drawer: string,    // Drawer's name
  gameState: GameState
}
```

---

#### ROUND_END
Round has ended.

**Payload:**
```javascript
{
  word: string,
  scores: Array<{
    id: string,
    name: string,
    score: number
  }>,
  gameState: GameState
}
```

---

#### GAME_END
Game has finished.

**Payload:**
```javascript
{
  finalScores: Array<{
    id: string,
    name: string,
    score: number
  }>,
  gameState: GameState
}
```

---

#### DRAW
Drawing data from drawer.

**Payload:** Same as client's DRAW event

---

#### CLEAR_CANVAS
Canvas should be cleared.

**Payload:** None

---

#### UNDO
Last action should be undone.

**Payload:** None

---

#### CHAT_MESSAGE
Chat message or guess.

**Payload:**
```javascript
{
  id: string,
  playerId: string,
  playerName: string,
  message: string,
  timestamp: number,
  isSystem: boolean,
  isCorrect: boolean
}
```

---

#### CORRECT_GUESS
Player guessed correctly.

**Payload:**
```javascript
{
  playerId: string,
  playerName: string,
  points: number
}
```

---

#### CLOSE_GUESS
Guess was close to correct answer.

**Payload:**
```javascript
{
  message: string // "You're close!"
}
```

---

#### GAME_STATE_UPDATE
General game state update.

**Payload:**
```javascript
{
  gameState: GameState
}
```

---

#### TIMER_UPDATE
Round timer update.

**Payload:**
```javascript
{
  timeRemaining: number // Milliseconds
}
```

---

## Data Types

### GameState
```typescript
{
  state: 'waiting' | 'choosing_word' | 'drawing' | 'intermission' | 'ended',
  currentRound: number,
  totalRounds: number,
  currentDrawerId: string | null,
  currentWord: string | null,
  hostId: string,
  players: Array<{
    id: string,
    socketId: string,
    name: string,
    score: number,
    hasGuessed: boolean
  }>
}
```

### ChatMessage
```typescript
{
  id: string,
  playerId: string,
  playerName: string,
  message: string,
  timestamp: number,
  isSystem: boolean,
  isCorrect: boolean
}
```

### DrawingAction
```typescript
{
  type: 'segment' | 'stroke' | 'fill',
  data: {
    // Segment
    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,
    
    // Stroke
    points?: Array<{x: number, y: number}>,
    
    // Fill
    x?: number,
    y?: number,
    
    // Common
    color: string,
    size: number,
    tool: 'pencil' | 'eraser' | 'bucket'
  }
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| ROOM_NOT_FOUND | Room not found | Invalid or expired room code |
| ROOM_FULL | Room is full | Maximum 36 players reached |
| INVALID_NAME | Invalid player name | Name too long or empty |
| NOT_HOST | Not authorized | Only host can start game |
| NOT_ENOUGH_PLAYERS | Not enough players | Minimum 3 players required |
| GAME_IN_PROGRESS | Game already started | Cannot join during game |
| RATE_LIMIT | Too many requests | Exceeded guess rate limit |
| INVALID_WORD | Invalid word choice | Word not in provided choices |
| NOT_DRAWER | Not authorized | Only drawer can draw/clear |

---

## Rate Limits

- **Guesses**: 3 per second per player
- **Drawing actions**: Unlimited (real-time)
- **Room creation**: Unlimited
- **Room joining**: Unlimited

---

## Connection Configuration

### Client Connection
```javascript
const socket = io('http://localhost:3002', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### Server Configuration
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
```

---

## Example Usage

### Creating and Starting a Game

```javascript
// 1. Connect to server
const socket = io('http://localhost:3002');

// 2. Create room
socket.emit('create_room', { playerName: 'Alice' });

socket.on('room_created', ({ roomId, gameState }) => {
  console.log('Room created:', roomId);
});

// 3. Wait for players to join...

// 4. Start game (as host)
socket.emit('start_game');

// 5. Choose word (as drawer)
socket.on('choose_word', ({ words }) => {
  socket.emit('word_chosen', { word: words[0] });
});

// 6. Draw
socket.emit('draw', {
  type: 'segment',
  data: {
    x0: 100, y0: 100,
    x1: 150, y1: 150,
    color: '#FF0000',
    size: 5,
    tool: 'pencil'
  }
});

// 7. Complete stroke
socket.emit('draw', {
  type: 'stroke',
  data: {
    points: [{x: 100, y: 100}, {x: 150, y: 150}],
    color: '#FF0000',
    size: 5,
    tool: 'pencil'
  }
});

// 8. Submit guess (as guesser)
socket.emit('send_guess', { guess: 'cat' });
```

---

**API Version**: 1.0.0  
**Last Updated**: November 27, 2025
