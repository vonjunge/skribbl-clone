# Setup and Run Instructions

## Prerequisites Check

Before running the application, ensure you have:

1. **Node.js installed** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm installed** (comes with Node.js)
   - Verify installation: `npm --version`

## Setup Steps

### Step 1: Install Server Dependencies
```powershell
cd server
npm install
```

This will install:
- express: Web server framework
- socket.io: Real-time WebSocket communication
- cors: Cross-origin resource sharing

### Step 2: Install Client Dependencies
```powershell
cd ../client
npm install
```

This will install:
- react: UI framework
- react-dom: React DOM renderer
- socket.io-client: WebSocket client
- vite: Build tool and dev server

### Step 3: Start the Server
Open a new terminal window and run:
```powershell
cd server
npm start
```

You should see:
```
🎮 Game server running on port 3002
🔌 WebSocket server ready
📊 Health check available at http://localhost:3002/health
```

### Step 4: Start the Client
Open another terminal window and run:
```powershell
cd client
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open the Game
Open your browser and go to: http://localhost:5173

## Testing the Game

### Single Player Test
1. Enter your name (e.g., "Player1")
2. Click "Create Room"
3. You'll see a room code (e.g., "ABC123")
4. Note: You need at least 3 players to start

### Multiplayer Test
1. Open 3 browser windows (or use incognito mode)
2. Window 1: Create room, note the room code
3. Window 2: Join room with the code
4. Window 3: Join room with the code
5. In Window 1: Click "Start Game"
6. Drawer will see word choices
7. Choose a word and start drawing!

## Troubleshooting

### Port Already in Use
If port 3002 or 5173 is already in use:

**Change server port:**
Edit `server/src/server.js`:
```javascript
const PORT = process.env.PORT || 3003; // Change to 3003
```

**Change client port:**
Edit `client/vite.config.js` and add:
```javascript
export default defineConfig({
  // ... existing config
  server: {
    port: 5174, // Change to any available port
  }
})
```

### Cannot Connect to Server
1. Verify server is running (check terminal output)
2. Check server URL in browser: http://localhost:3002/health
3. Should return: `{"status":"healthy","rooms":0,"timestamp":"..."}`
4. If client can't connect, verify `VITE_SERVER_URL` is set to `http://localhost:3002` in client/.env

### Drawing Not Working
1. Ensure you're the current drawer
2. Check browser console for errors (F12)
3. Verify WebSocket connection is established

## Development Mode

The application runs in development mode by default with:
- Hot module replacement (HMR)
- Source maps for debugging
- Detailed error messages
- Auto-restart on file changes (client only)

## Production Build

To build for production:

```powershell
# Build client
cd client
npm run build

# The built files will be in client/dist/
# Deploy these files to any static hosting service

# For server, just run:
cd server
npm start
```

## Environment Variables

Create `.env` files from examples:

```powershell
# Client
cd client
Copy-Item .env.example .env

# Server
cd ../server
Copy-Item .env.example .env
```

Edit these files to customize configuration.

## Quick Commands Reference

```powershell
# Install all dependencies (from root)
cd server; npm install; cd ../client; npm install

# Start both server and client (requires 2 terminals)
# Terminal 1:
cd server; npm start

# Terminal 2:
cd client; npm run dev

# Check server health
curl http://localhost:3002/health

# Build for production
cd client; npm run build
```

## Next Steps

1. Read the full README.md for detailed documentation
2. Review prompt.md for complete project specifications
3. Explore the codebase structure
4. Try modifying game settings in shared/constants.js
5. Add more words to server/src/words.js

Enjoy your multiplayer drawing game! 🎨
