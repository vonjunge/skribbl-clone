# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-07

### Changed - Game Logic Overhaul
- **Random Drawer Selection**: Drawers are now selected randomly from available players instead of sequential order
- **Round Counting**: Each turn (one person drawing) now counts as 1 round, not a full cycle through all players
- **Fair Rotation**: Implemented drawer pool system - no player can be selected twice until everyone has had a turn
- **Configurable Rounds**: Host can now configure number of rounds (1-10 turns) instead of fixed count
- **Configurable Round Time**: Host can now configure round duration (30-180 seconds) in the lobby
- **Game End Logic**: Game now ends when the configured number of rounds (turns) is reached

### Technical Changes
- Added `availableDrawers` array to GameRoom class for tracking eligible drawers
- Modified `startNewTurn()` to randomly select from available drawers
- Updated `advanceToNextRound()` to increment per turn instead of per cycle
- Simplified `removePlayer()` logic by removing complex turn-tracking calculations
- Updated client lobby UI to clarify "Total number of turns in the game"

### Documentation Updates
- Updated README.md with new game flow and configuration
- Updated FEATURES.md with random selection details
- Updated PROJECT_SUMMARY.md, QUICK_REFERENCE.md, IMPLEMENTATION.md
- Updated TROUBLESHOOTING.md with new test cases
- Changed default TOTAL_ROUNDS from 8 to 3 in constants.js

### Benefits
- More unpredictable and exciting gameplay
- Fairer distribution of drawing opportunities
- More flexible game length configuration
- Better suited for varying player counts
- Improved game balance

---

## [1.0.0] - 2025-11-27

### Added - Initial Release
- Real-time multiplayer drawing game
- Support for up to 36 concurrent players per room
- HTML5 Canvas with drawing tools (pencil, eraser, bucket fill)
- 25+ color palette with custom color picker
- Brush size adjustment (1-100 pixels)
- Undo and clear canvas functionality
- Real-time WebSocket communication with Socket.io
- Room creation and joining with unique 6-character codes
- Host controls for game start
- Word selection from 550+ word database
- Smart guessing with Levenshtein distance for close matches
- Time-based scoring system (up to 1000 points)
- Live leaderboard with real-time updates
- Chat system with guess submission
- Round end summaries
- Final game leaderboard with top 3 highlights
- Rate limiting and anti-cheat measures
- Graceful disconnect handling
- Mobile-responsive design
- Comprehensive documentation

### Core Features
- Turn-based gameplay with automatic rotation
- 8 rounds per game (original default)
- 80-second round timer
- 7-second intermission between rounds
- Maximum 1000 points per correct guess
- Drawer earns 50 points per correct guess
- Support for 3-36 players per room

### Technical Stack
- Frontend: React 18 + Vite
- Backend: Node.js + Express
- Real-time: Socket.io
- Canvas: HTML5 Canvas API
- Styling: CSS with modern animations

---

## Version History

- **v1.1.0** (Current) - Random drawer selection and flexible rounds
- **v1.0.0** - Initial production release

---

**Maintained by**: Skribbl Clone Development Team  
**License**: MIT
