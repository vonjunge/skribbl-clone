# Quick Reference Guide

## 🚀 Quick Start Commands

### First Time Setup
```powershell
# Option 1: Use setup script (recommended)
.\setup.ps1

# Option 2: Manual installation
cd server
npm install
cd ../client
npm install
```

### Running the Game
```powershell
# Terminal 1: Start server
.\start-server.ps1
# OR manually:
cd server
npm start

# Terminal 2: Start client
.\start-client.ps1
# OR manually:
cd client
npm run dev
```

### Access the Game
- **Client**: http://localhost:3000
- **Server Health**: http://localhost:3001/health

## 📝 Key File Locations

### Configuration
- `shared/constants.js` - Game settings (player count, timing, scoring)
- `server/src/words.js` - Word database (500+ words)
- `client/.env` - Client environment variables
- `server/.env` - Server environment variables

### Main Components
- `server/src/server.js` - Main server entry point
- `server/src/game/GameRoom.js` - Game logic and state
- `server/src/socket/socketHandlers.js` - WebSocket events
- `client/src/App.jsx` - Main React component
- `client/src/components/GameRoom.jsx` - Game interface
- `client/src/components/Canvas.jsx` - Drawing canvas

## 🎮 Game Configuration Quick Edit

### Change Player Limits
Edit `shared/constants.js`:
```javascript
MAX_PLAYERS: 36,  // Change to your desired max (1-100)
MIN_PLAYERS: 3,   // Minimum to start (2-10 recommended)
```

### Change Round Duration
```javascript
ROUND_TIME: 80000,  // In milliseconds (80 seconds)
```

### Change Number of Rounds
```javascript
TOTAL_ROUNDS: 3,  // Default number of turns (configurable 1-10 in lobby)
```

### Change Scoring
```javascript
MAX_POINTS: 1000,  // Maximum points for first correct guess
```

### Change Intermission Time
```javascript
INTERMISSION_TIME: 7000,  // Break between rounds (ms)
```

## 🎨 Customization Tips

### Add More Colors
Edit `shared/constants.js`:
```javascript
export const COLORS = [
  '#000000', '#FFFFFF', // Add your hex colors here
  // Add more colors...
];
```

### Add More Words
Edit `server/src/words.js`:
```javascript
export const WORDS = [
  'cat', 'dog', // Add your words here
  // Add more words...
];
```

### Change Brush Sizes
Edit `shared/constants.js`:
```javascript
export const BRUSH_SIZES = {
  SMALL: 2,   // pixels
  MEDIUM: 5,
  LARGE: 10,
  XLARGE: 15  // Add custom size
};
```

## 🔧 Common Modifications

### Change Server Port
Edit `server/src/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3001
```

### Change Client Port
Edit `client/vite.config.js`:
```javascript
server: {
  port: 3000, // Change 3000
  host: true
}
```

### Update Server URL (for production)
Edit `client/.env`:
```
VITE_SERVER_URL=https://your-server-url.com
```

## 📊 Testing Checklist

### Basic Functionality
- [ ] Create room and get room code
- [ ] Join room with valid code
- [ ] Start game with 3+ players
- [ ] Select word as drawer
- [ ] Draw on canvas
- [ ] Submit guesses as player
- [ ] Verify scoring
- [ ] Complete full round
- [ ] Verify round rotation
- [ ] Complete full game

### Advanced Testing
- [ ] Test with 10+ players
- [ ] Test player disconnect/reconnect
- [ ] Test drawer leaving mid-round
- [ ] Test undo functionality
- [ ] Test clear canvas
- [ ] Test rate limiting (spam guesses)
- [ ] Test close guesses
- [ ] Test all drawing tools
- [ ] Test all colors
- [ ] Test all brush sizes

## 🐛 Quick Troubleshooting

### Problem: Can't connect to server
**Solution**: Check if server is running on port 3001
```powershell
# Test server
curl http://localhost:3001/health
```

### Problem: Drawing not showing
**Solution**: Clear browser cache, refresh page, check console (F12)

### Problem: Port already in use
**Solution**: 
```powershell
# Find process using port (Windows)
netstat -ano | findstr :3001
# Kill process by PID
taskkill /PID <PID> /F
```

### Problem: npm not found
**Solution**: Install Node.js from https://nodejs.org/

### Problem: Dependencies not installing
**Solution**:
```powershell
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## 📈 Performance Tips

### For Better Performance
1. Close unused browser tabs
2. Use modern browser (Chrome/Edge recommended)
3. Ensure stable internet connection
4. Limit concurrent players in testing (start with 5-10)
5. Check CPU usage if laggy

### For Production Deployment
1. Use environment variables for configuration
2. Enable gzip compression
3. Use CDN for static assets
4. Implement Redis for scaling
5. Use PM2 for process management
6. Set up monitoring and logging

## 📦 Project Structure Quick Reference

```
skribbl_clone/
├── client/          # Frontend React app
├── server/          # Backend Node.js server
├── shared/          # Shared constants and types
├── README.md        # Full documentation
├── SETUP.md         # Setup instructions
├── setup.ps1        # Setup script
├── start-server.ps1 # Server start script
└── start-client.ps1 # Client start script
```

## 🎯 Key Features Summary

- ✅ 36 players per room
- ✅ Real-time drawing
- ✅ Smart guess validation
- ✅ Time-based scoring
- ✅ 8 rounds per game
- ✅ 500+ words
- ✅ Multiple drawing tools
- ✅ 25+ colors
- ✅ Undo/Clear canvas
- ✅ Live leaderboard
- ✅ Chat system
- ✅ Room codes
- ✅ Auto game progression

## 📞 Getting Help

1. Check README.md for detailed info
2. Check SETUP.md for installation help
3. Check IMPLEMENTATION.md for feature list
4. Review console logs (browser F12, server terminal)
5. Check common issues in troubleshooting section

## 🎉 Have Fun!

The game is ready to play! Gather your friends and start drawing!
