# Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Connection Issues

#### Issue: Client cannot connect to server
**Symptoms:**
- "Connecting..." message stays indefinitely
- Console shows connection errors
- Players cannot create/join rooms

**Solutions:**
1. **Verify server is running**
   ```bash
   # Check if server process is running
   # Should see: "🎮 Game server running on port 3002"
   ```

2. **Check server health endpoint**
   ```bash
   # Windows PowerShell
   Invoke-WebRequest http://localhost:3002/health
   
   # Or use browser
   # Navigate to: http://localhost:3002/health
   # Should return: {"status":"healthy","rooms":0,"timestamp":"..."}
   ```

3. **Verify VITE_SERVER_URL**
   - Check `client/.env` file exists
   - Should contain: `VITE_SERVER_URL=http://localhost:3002`
   - Restart client after changing

4. **Check firewall**
   - Allow Node.js through Windows Firewall
   - Check if port 3002 is blocked

5. **Check browser console**
   - Press F12 → Console tab
   - Look for WebSocket connection errors
   - Check for CORS errors

---

#### Issue: "WebSocket connection failed"
**Solutions:**
1. Ensure server is listening on `0.0.0.0` (it already is)
2. Try switching from WebSocket to polling:
   ```javascript
   // In client/src/services/socket.js
   const socket = io(SERVER_URL, {
     transports: ['polling', 'websocket'], // Try polling first
   });
   ```

---

### Port Conflicts

#### Issue: "Port 3002 already in use"
**Solutions:**

**Option 1: Kill existing process**
```powershell
# Windows
netstat -ano | findstr :3002
taskkill /PID [PID_NUMBER] /F

# Example:
# netstat -ano | findstr :3002
# TCP  0.0.0.0:3002  0.0.0.0:0  LISTENING  12345
# taskkill /PID 12345 /F
```

**Option 2: Change server port**
```javascript
// server/src/server.js
const PORT = process.env.PORT || 3003; // Change to 3003
```

Don't forget to update client:
```env
# client/.env
VITE_SERVER_URL=http://localhost:3003
```

---

#### Issue: "Port 5173 already in use"
**Solutions:**

**Option 1: Kill existing Vite process**
```powershell
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

**Option 2: Change client port**
```javascript
// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Change port
  }
})
```

---

### Game Issues

#### Issue: Cannot start game
**Symptoms:**
- "Start Game" button doesn't work
- No error message shown

**Solutions:**
1. **Verify you are the host**
   - Only the first player (room creator) can start
   - Check if you see "Host" indicator

2. **Check minimum players**
   - Need at least 3 players
   - Current player count shown in player list

3. **Check game state**
   - Game must be in 'waiting' state
   - Cannot start if game already in progress

4. **Check browser console**
   - Press F12 → Console
   - Look for "Not authorized" or "Not enough players" errors

---

#### Issue: "Start Game" button not visible
**Cause:** You are not the host

**Solution:**
- Wait for host to start
- Or have host leave and you'll become new host
- Or create your own room

---

#### Issue: Word choices not appearing for drawer
**Symptoms:**
- Game starts but drawer doesn't see word options
- Stuck on choosing word screen

**Solutions:**
1. **Check browser console** for errors
2. **Refresh the page** and rejoin
3. **Check server logs** for word generation errors
4. **Verify words.js** file exists in server/src/

---

#### Issue: Timer not counting down
**Solutions:**
1. **Refresh the page**
2. **Check WebSocket connection** (F12 → Network → WS tab)
3. **Verify server is emitting timer updates** (check server console)

---

### Drawing Issues

#### Issue: Cannot draw on canvas
**Symptoms:**
- Mouse clicks/drags have no effect
- Canvas appears frozen

**Solutions:**
1. **Verify you are the drawer**
   - Only current drawer can draw
   - Check if word is displayed (not masked)

2. **Check game state**
   - Must be in 'drawing' state
   - Not during 'choosing_word' or 'intermission'

3. **Verify tool is selected**
   - Click on pencil/eraser/bucket tool
   - Should be highlighted when active

4. **Browser console check**
   - Press F12
   - Look for drawing-related errors

---

#### Issue: Drawing not visible to other players
**Symptoms:**
- Drawer can see their drawing
- Other players see blank canvas

**Solutions:**
1. **Check WebSocket connection** for all players
2. **Verify DRAW events** are being sent (F12 → Network → WS)
3. **Refresh non-drawer browsers**
4. **Check if players are in the same room** (verify room code)

---

#### Issue: Bucket fill is slow or doesn't work
**Symptoms:**
- Clicking takes several seconds
- Fill doesn't complete
- Browser becomes unresponsive

**Solutions:**
1. **Use smaller brush sizes** for initial drawing
2. **Don't fill very large areas** (optimization issue with complex shapes)
3. **Clear canvas** if it becomes too complex
4. **Check canvas size** - smaller canvas = faster fill

**Technical Note:** Bucket fill uses a multi-pass algorithm that may be slow on:
- Very large canvases
- Areas with many anti-aliased edges
- Complex drawings with many colors

---

#### Issue: Undo not working correctly
**Symptoms:**
- Undo removes tiny parts instead of full strokes
- Undo does nothing

**Solutions:**
1. **This should be fixed** in current version (stroke-based undo)
2. **If persisting:**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Check for JavaScript errors in console

---

#### Issue: Brush preview not showing
**Solutions:**
1. **Verify tool is selected** (pencil or eraser)
2. **Mouse must be over canvas**
3. **Check if `mousePos` state is updating** (React DevTools)
4. **No preview for bucket tool** (intentional)

---

### Chat & Guessing Issues

#### Issue: Guesses not submitting
**Symptoms:**
- Type message and press Enter, nothing happens
- Chat input disabled

**Solutions:**
1. **Verify you are NOT the drawer**
   - Drawer cannot submit guesses
   - Input should be enabled for guessers

2. **Check if already guessed correctly**
   - Once correct, cannot guess again
   - Wait for next round

3. **Check rate limit**
   - Maximum 3 guesses per second
   - Wait a moment between guesses

4. **Verify WebSocket connection**
   - Check browser console for disconnection errors

---

#### Issue: Correct guess not recognized
**Symptoms:**
- Type correct word but not marked as correct
- No points awarded

**Solutions:**
1. **Check spelling** - must be exact match
2. **Case doesn't matter** - "CAT" = "cat"
3. **Remove extra spaces** - "cat " may not match "cat"
4. **Wait for word to be chosen** - drawer must select word first
5. **Check if you're the drawer** - drawer cannot guess

---

#### Issue: Chat messages not appearing for other players
**Solutions:**
1. **Check WebSocket connection** for all players
2. **Verify room IDs match** (same room code)
3. **Refresh browsers**
4. **Check server logs** for chat broadcast errors

---

### Player Management Issues

#### Issue: Player disconnected but still in player list
**Cause:** Disconnect event not processed properly

**Solutions:**
1. **Wait 30 seconds** - may auto-remove
2. **Host can start game anyway** - disconnected player skipped
3. **Restart server** if persisting (last resort)

---

#### Issue: Host left and no new host assigned
**Symptoms:**
- No one can start game
- No "Host" indicator shown

**Solutions:**
1. **Should auto-transfer** to first remaining player
2. **If not working:**
   - All players leave and rejoin
   - Check server console for errors
   - File a bug report

---

### Performance Issues

#### Issue: Lag when drawing
**Symptoms:**
- Strokes appear delayed
- Choppy drawing experience

**Solutions:**
1. **Check network latency**
   - Test internet connection speed
   - Prefer wired over WiFi

2. **Reduce brush size**
   - Smaller brushes = less data to transmit

3. **Close other tabs**
   - Free up browser resources

4. **Check server load**
   - Too many concurrent rooms?
   - Server CPU/memory usage?

5. **Use drawing in segments** (already implemented)
   - Real-time transmission should minimize lag

---

#### Issue: Browser becomes slow/unresponsive
**Symptoms:**
- Tab freezes
- High CPU usage
- Canvas stops responding

**Solutions:**
1. **Reduce canvas complexity**
   - Use clear canvas more often
   - Avoid excessive bucket fills

2. **Close other tabs/applications**

3. **Update browser** to latest version

4. **Increase browser memory** (if available)

5. **Use hardware acceleration**
   - chrome://settings → System
   - Enable "Use hardware acceleration when available"

---

### Installation Issues

#### Issue: npm install fails
**Symptoms:**
- Error messages during installation
- Missing dependencies

**Solutions:**
1. **Update Node.js**
   ```powershell
   node --version  # Should be 16+
   ```
   Download from: https://nodejs.org/

2. **Clear npm cache**
   ```powershell
   npm cache clean --force
   ```

3. **Delete node_modules and retry**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

4. **Check internet connection**
   - npm needs to download packages

5. **Try different npm registry**
   ```powershell
   npm config set registry https://registry.npmjs.org/
   ```

---

#### Issue: "Cannot find module" errors
**Solutions:**
1. **Verify dependencies installed**
   ```powershell
   cd server
   npm install
   cd ../client
   npm install
   ```

2. **Check package.json** files exist

3. **Reinstall specific package**
   ```powershell
   npm install [package-name]
   ```

---

### Build/Deployment Issues

#### Issue: Production build fails
**Symptoms:**
- `npm run build` errors
- Missing environment variables

**Solutions:**
1. **Set production environment variables**
   ```env
   # client/.env.production
   VITE_SERVER_URL=https://your-server.com
   ```

2. **Check for console.logs** (may be warnings)

3. **Verify all imports** use correct paths

4. **Clear dist folder**
   ```powershell
   Remove-Item -Recurse -Force dist
   npm run build
   ```

---

#### Issue: Deployed app cannot connect to server
**Solutions:**
1. **Update VITE_SERVER_URL** to production server URL

2. **Check CORS settings** on server:
   ```javascript
   // server/src/server.js
   cors: {
     origin: 'https://your-frontend-domain.com',
     methods: ['GET', 'POST']
   }
   ```

3. **Ensure WebSocket port is open** on server

4. **Check SSL/TLS** if using https

5. **Verify server is accessible** from internet:
   ```powershell
   curl https://your-server.com/health
   ```

---

## 🛠️ Debugging Tools

### Browser Console
```javascript
// Check WebSocket connection
socketService.socket.connected

// Get current room state
console.log(gameState)

// Check drawing history
console.log(drawingHistory)

// Test socket emit
socketService.emit('test_event', { data: 'test' })
```

### Server Logs
Server automatically logs:
- ✅ Player connections/disconnections
- ✅ Room creations/joins
- ✅ Game state changes
- ✅ Drawing events
- ✅ Errors

Check terminal running server for detailed logs.

### Network Tab (F12)
- **WS Tab**: View WebSocket messages
- **Headers**: Check connection details
- **Messages**: See all socket events in real-time

---

## 📞 Getting Help

If issues persist:

1. **Check browser console** (F12 → Console)
2. **Check server console** output
3. **Review this troubleshooting guide**
4. **Check API.md** for event formats
5. **Review FEATURES.md** for expected behavior
6. **Create GitHub issue** with:
   - Detailed description
   - Steps to reproduce
   - Error messages
   - Browser and OS info
   - Screenshots if applicable

---

## 🔧 Quick Diagnostics Checklist

Run through this checklist:

- [ ] Node.js version 16+ installed
- [ ] Server running on port 3002
- [ ] Client running on port 5173
- [ ] `/health` endpoint returns "healthy"
- [ ] Browser console shows no errors
- [ ] WebSocket connection established (green in Network tab)
- [ ] Room created successfully
- [ ] Can join room with code
- [ ] Minimum 3 players present
- [ ] Host can see "Start Game" button
- [ ] Drawer sees word choices after start
- [ ] Drawing tools work (pencil, eraser, bucket)
- [ ] Other players see drawings in real-time
- [ ] Guesses submit correctly
- [ ] Timer counts down
- [ ] Round ends automatically
- [ ] Scores update correctly
- [ ] Game ends after configured rounds
- [ ] Drawers selected randomly without repetition

---

**Last Updated**: December 7, 2025  
**Version**: 1.1.0
