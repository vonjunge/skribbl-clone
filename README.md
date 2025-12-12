# 🎨 Skribbl Clone - Multiplayer Drawing Game

A real-time browser-based multiplayer drawing and guessing game built with React, Node.js, and Socket.io. Support up to 36 concurrent players per room with smooth real-time synchronization.

![Game Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![Players](https://img.shields.io/badge/Players-Up%20to%2036-blue)
![Version](https://img.shields.io/badge/Version-1.1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Latest Updates (v1.1.0)

### Game Logic Improvements
- **Random Drawer Selection**: Drawers are now selected randomly instead of sequential order
- **Fair Rotation System**: No player draws twice until everyone has had a turn
- **Flexible Round System**: Each turn counts as one round (not cycles)
- **Host Configuration**: Configurable round time (30-180s) and number of rounds (1-10)
- **Improved Balance**: Better gameplay experience with unpredictable drawer selection

## 🎮 Features

### Core Gameplay
- **Real-time Drawing**: HTML5 Canvas with smooth stroke synchronization and live drawing visibility
- **Random Drawer Selection**: Fair random selection without repetition until all players have drawn
- **Turn-based System**: Each turn counts as one round with customizable total rounds
- **Smart Guessing**: Instant validation with close guess hints using Levenshtein distance
- **Dynamic Scoring**: Points based on guess speed (faster = more points)
- **Live Leaderboard**: Real-time score updates and final game leaderboard
- **Host Controls**: Only the room host can start the game and configure rounds
- **Automatic Round Progression**: Smart turn management when players leave

### Drawing Tools
- ✏️ **Pencil**: Adjustable size from 1-100 pixels with smooth strokes
- 🎨 **25+ Colors**: Pre-selected vibrant palette
- 🎨 **Custom Color Picker**: RGB color wheel for unlimited color choices
- 🪣 **Bucket Fill**: Advanced flood fill with anti-aliasing support
- 🧹 **Eraser**: Size-adjustable eraser matching brush sizes
- 👁️ **Brush Preview**: Real-time cursor preview showing exact size and color
- ↶ **Undo**: Stroke-based undo (removes complete strokes)
- 🗑️ **Clear Canvas**: Full canvas clear (drawer only)

### Multiplayer Features
- 🏠 Create/join rooms with unique codes
- 👥 Support for 36 concurrent players per room
- 💬 Real-time chat with guess submission
- ⏱️ Configurable round time (30-180 seconds) with countdown timer
- 🔄 Configurable rounds (1-10 turns) with random drawer selection
- 🎲 No player draws twice until everyone has had a turn
- 📊 Intermission screens showing round results

### Technical Highlights
- WebSocket-based real-time communication
- Optimized drawing delta transmission
- Room-based message broadcasting
- Anti-cheat measures (rate limiting, drawer validation)
- Graceful disconnection handling
- Mobile-responsive design (1024px+)

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
cd skribbl_clone
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 3. Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```
Server runs on `http://localhost:3002`

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173` (Vite default)

### 4. Play the Game

1. Open `http://localhost:5173` in your browser
2. Enter your name and click "Create Room"
3. Share the room code with friends
4. Friends can join using "Join Room" with your code
5. Host clicks "Start Game" when ready (minimum 3 players required)
6. Drawer chooses a word from 3 options
7. Take turns drawing and guessing!

## 📁 Project Structure

```
skribbl_clone/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Canvas.jsx    # Drawing canvas with tools
│   │   │   ├── Chat.jsx      # Chat and guess submission
│   │   │   ├── GameRoom.jsx  # Main game interface
│   │   │   ├── Lobby.jsx     # Room creation/joining
│   │   │   └── PlayerList.jsx # Player leaderboard
│   │   ├── services/
│   │   │   └── socket.js     # Socket.io client service
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Backend Node.js application
│   ├── src/
│   │   ├── game/
│   │   │   ├── GameRoom.js   # Game logic and state management
│   │   │   └── RoomManager.js # Room lifecycle management
│   │   ├── socket/
│   │   │   └── socketHandlers.js # WebSocket event handlers
│   │   ├── words.js          # 500+ word database
│   │   └── server.js         # Express + Socket.io server
│   └── package.json
│
├── shared/                    # Shared types and constants
│   ├── constants.js          # Game configuration
│   └── types.js              # Data models
│
├── README.md                 # This file
└── prompt.md                 # Project specification
```

## 🎯 How to Play

### Game Flow
1. **Lobby**: Players join a room (3-36 players required)
2. **Configuration**: Host sets round time (30-180s) and number of rounds (1-10 turns)
3. **Random Selection**: System randomly selects a drawer from players who haven't drawn yet
4. **Word Selection**: Drawer chooses from 3 random words
5. **Drawing Phase**: Drawer has the configured time to illustrate the word
6. **Guessing Phase**: Other players type guesses in chat
7. **Scoring**: Faster guesses earn more points (up to 1000 points)
8. **Round End**: Word revealed, scores updated
9. **Repeat**: Another random player (who hasn't drawn) becomes drawer
10. **Game End**: After all rounds complete, final leaderboard displayed

### Scoring System
- **Correct Guess**: Points = 1000 × (time_remaining / round_time)
- **First Guesser**: Maximum 1000 points (if guessing immediately)
- **Later Guessers**: Points decrease as time passes
- **Drawer Bonus**: 50 points for each player who guessed correctly

### Tips
- Draw clearly and use different colors
- Start with simple shapes to help others guess
- Type quickly for more points!
- Close guesses show "You're close!" hint

## 🔧 Configuration

### Server Configuration
Edit `server/src/server.js`:
```javascript
const PORT = process.env.PORT || 3002;
```

### Game Settings
Edit `shared/constants.js`:
```javascript
export const GAME_CONFIG = {
  MAX_PLAYERS: 36,           // Maximum players per room
  MIN_PLAYERS: 3,            // Minimum to start game
  ROUND_TIME: 80000,         // Default round duration (ms)
  INTERMISSION_TIME: 7000,   // Break between rounds (ms)
  TOTAL_ROUNDS: 3,           // Default number of turns per game
  MAX_POINTS: 1000,          // Maximum points per guess
  WORD_CHOICES: 3,           // Word options for drawer
  MAX_GUESSES_PER_SECOND: 3, // Rate limit
  UNDO_HISTORY_SIZE: 10      // Undo stack size
};

export const BRUSH_SIZES = {
  MIN: 1,                    // Minimum brush size (pixels)
  MAX: 100,                  // Maximum brush size (pixels)
  DEFAULT: 5                 // Default brush size
};

export const DRAWING_TOOLS = {
  PENCIL: 'pencil',          // Drawing tool
  ERASER: 'eraser',          // Eraser tool
  BUCKET: 'bucket'           // Flood fill tool
};
```

### Client Configuration
Create `client/.env`:
```
VITE_SERVER_URL=http://localhost:3002
```

For production, update to your deployed server URL (e.g., `https://your-server.com`).

## 🐳 Docker Deployment (Optional)

### Server Dockerfile
Create `server/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

### Client Dockerfile
Create `client/Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
  
  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
    environment:
      - VITE_SERVER_URL=http://server:3002
```

Run: `docker-compose up`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create room and verify room code generation
- [ ] Join room with multiple players (test with 3-10 players)
- [ ] Start game with minimum players
- [ ] Verify word selection modal appears for drawer
- [ ] Test drawing with different tools, colors, and sizes
- [ ] Verify real-time drawing synchronization across clients
- [ ] Submit correct and incorrect guesses
- [ ] Verify scoring calculation and leaderboard updates
- [ ] Test undo and clear canvas functionality
- [ ] Verify round timer countdown
- [ ] Check round end modal with word reveal
- [ ] Test game completion after all rounds
- [ ] Verify player disconnect handling
- [ ] Test rate limiting on guess submissions

### Load Testing (36 Players)
Use tools like `socket.io-client` to simulate multiple connections:
```bash
npm install socket.io-client
node test-load.js
```

## 🚀 Production Deployment

### Environment Variables
**Server:**
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (production/development)

**Client:**
- `VITE_SERVER_URL`: Backend WebSocket URL

### Build for Production

**Client:**
```bash
cd client
npm run build
```
Outputs to `client/dist/`

**Server:**
```bash
cd server
npm start
```

### Deployment Platforms
- **Heroku**: Deploy server with Procfile
- **Vercel/Netlify**: Deploy client static files
- **AWS EC2**: Full control with custom configuration
- **DigitalOcean**: App Platform for easy deployment
- **Railway**: One-click deployment

### Performance Tips
- Use CDN for static assets
- Enable gzip compression
- Implement Redis for multi-instance scaling
- Use sticky sessions for WebSocket
- Monitor with PM2 or Forever

## 🔒 Security Considerations

- Input sanitization on chat messages
- Rate limiting on guesses and drawing actions
- Room code validation
- Player name length restrictions (max 20 chars)
- Canvas data validation
- WebSocket connection authentication

## 🐛 Troubleshooting

### Common Issues

**Issue**: Client can't connect to server
- **Solution**: Verify server is running on port 3002
- Check `VITE_SERVER_URL` in client environment (should be `http://localhost:3002`)
- Ensure firewall allows WebSocket connections
- Check browser console for connection errors

**Issue**: Drawing lag or delays
- **Solution**: Check network latency
- Reduce concurrent players if hosting locally
- Optimize drawing data transmission

**Issue**: Players disconnecting frequently
- **Solution**: Increase pingTimeout in server config
- Check client internet connection stability
- Implement reconnection logic

**Issue**: Room not found error
- **Solution**: Verify room code is correct (6 characters)
- Check if room expired (inactive rooms cleaned every 5 min)
- Ensure server hasn't restarted

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎓 Learning Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check existing issues for solutions
- Review troubleshooting section

## 🎉 Acknowledgments

Built following industry best practices for real-time multiplayer games. Inspired by Skribbl.io.

---

**Enjoy drawing and guessing! 🎨**
