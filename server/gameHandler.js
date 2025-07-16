const GameRoom = require('./models/GameRoom');
const {
  assignRolesAndConcepts,
  calculateScores,
  generateRoomCode,
  validateWordSubmission,
  shouldMoveToVoting,
  getGameState
} = require('./gameLogic');

// Store active socket connections
const activeConnections = new Map();

const gameHandler = (io, socket) => {
  console.log('Game handler initialized for socket:', socket.id);
  
  // Store socket connection
  activeConnections.set(socket.id, {
    socket,
    playerId: null,
    roomCode: null
  });

  // Handle creating a new room
  socket.on('create_room', async (playerName, callback) => {
    try {
      if (!playerName || playerName.trim().length === 0) {
        callback({ success: false, error: 'Player name is required' });
        return;
      }

      const roomCode = await generateRoomCode();
      
      const newRoom = new GameRoom(roomCode);
      newRoom.players = [{
        id: socket.id,
        name: playerName.trim(),
        role: 'concept',
        concept: null,
        words: [],
        votes: 0,
        isHost: true,
        score: 0
      }];
      newRoom.gameState = 'waiting';

      await newRoom.save();
      
      // Join socket room
      socket.join(roomCode);
      
      // Update connection info
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.playerId = socket.id;
        connection.roomCode = roomCode;
      }

      callback({ 
        success: true, 
        roomCode,
        gameState: getGameState(newRoom, socket.id)
      });
      
      // Notify room about new player
      io.to(roomCode).emit('room_update', getGameState(newRoom, socket.id));
      
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, error: 'Failed to create room' });
    }
  });

  // Handle joining an existing room
  socket.on('join_room', async (roomCode, playerName, callback) => {
    try {
      if (!roomCode || !playerName || playerName.trim().length === 0) {
        callback({ success: false, error: 'Room code and player name are required' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
      
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.gameState !== 'waiting') {
        callback({ success: false, error: 'Game is already in progress' });
        return;
      }

      if (room.players.length >= 10) {
        callback({ success: false, error: 'Room is full' });
        return;
      }

      // Check if player name is already taken
      const existingPlayer = room.players.find(p => p.name === playerName.trim());
      if (existingPlayer) {
        callback({ success: false, error: 'Player name is already taken' });
        return;
      }

      // Add player to room
      room.players.push({
        id: socket.id,
        name: playerName.trim(),
        role: 'concept',
        concept: null,
        words: [],
        votes: 0,
        isHost: false,
        score: 0
      });

      await room.save();
      
      // Join socket room
      socket.join(roomCode);
      
      // Update connection info
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.playerId = socket.id;
        connection.roomCode = roomCode;
      }

      callback({ 
        success: true, 
        roomCode,
        gameState: getGameState(room, socket.id)
      });
      
      // Notify all players in room
      io.to(roomCode).emit('room_update', getGameState(room, socket.id));
      
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  // Handle starting the game
  socket.on('start_game', async (callback) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection || !connection.roomCode) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode: connection.roomCode });
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      // Check if player is host
      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        callback({ success: false, error: 'Only host can start the game' });
        return;
      }

      // Check if enough players
      if (!room.canStartGame()) {
        callback({ success: false, error: 'Need 4-10 players to start' });
        return;
      }

      // Assign roles and concepts
      const { theme, concepts, players } = assignRolesAndConcepts(room.players);
      
      room.currentTheme = theme;
      room.concepts = concepts;
      room.players = players;
      room.gameState = 'playing';
      room.currentRound = 1;
      
      // Start with first active (non-eliminated) player
      const firstActivePlayerIndex = room.players.findIndex(p => p.status !== 'eliminated');
      room.currentPlayerIndex = firstActivePlayerIndex >= 0 ? firstActivePlayerIndex : 0;

      await room.save();

      callback({ success: true });
      
      // Notify all players that game has started
      room.players.forEach(p => {
        const playerSocket = io.sockets.sockets.get(p.id);
        if (playerSocket) {
          playerSocket.emit('game_started', getGameState(room, p.id));
        }
      });
      
    } catch (error) {
      console.error('Error starting game:', error);
      callback({ success: false, error: 'Failed to start game' });
    }
  });

  // Handle word submission
  socket.on('submit_word', async (word, callback) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection || !connection.roomCode) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode: connection.roomCode });
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.gameState !== 'playing') {
        callback({ success: false, error: 'Game is not in progress' });
        return;
      }

      // Check if player is eliminated
      const submittingPlayer = room.players.find(p => p.id === socket.id);
      if (!submittingPlayer || submittingPlayer.status === 'eliminated') {
        callback({ success: false, error: 'Eliminated players cannot submit words' });
        return;
      }

      // Check if it's player's turn
      const currentPlayer = room.getCurrentPlayer();
      if (!currentPlayer || currentPlayer.id !== socket.id) {
        callback({ success: false, error: 'Not your turn' });
        return;
      }

      // Validate word
      const validation = validateWordSubmission(word);
      if (!validation.valid) {
        callback({ success: false, error: validation.error });
        return;
      }

      // Add word to player's words
      currentPlayer.words.push({
        word: validation.word,
        round: room.currentRound,
        timestamp: new Date()
      });

      // Move to next player
      room.nextPlayer();
      
      // Check if we should move to voting phase
      if (shouldMoveToVoting(room)) {
        room.gameState = 'voting';
        room.votingResults = [];
      }

      await room.save();

      callback({ success: true });
      
      // Notify all players of the update
      if (room.gameState === 'voting') {
        // Game moved to voting phase
        io.to(connection.roomCode).emit('voting_phase', getGameState(room, socket.id));
      } else {
        // Continue with next player's turn
        room.players.forEach(p => {
          const playerSocket = io.sockets.sockets.get(p.id);
          if (playerSocket) {
            playerSocket.emit('game_update', getGameState(room, p.id));
          }
        });
      }
      
    } catch (error) {
      console.error('Error submitting word:', error);
      callback({ success: false, error: 'Failed to submit word' });
    }
  });

  // Handle voting
  socket.on('vote', async (suspectedMindlessId, callback) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection || !connection.roomCode) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode: connection.roomCode });
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.gameState !== 'voting') {
        callback({ success: false, error: 'Not in voting phase' });
        return;
      }

      // Check if player is eliminated
      const votingPlayer = room.players.find(p => p.id === socket.id);
      if (!votingPlayer || votingPlayer.status === 'eliminated') {
        callback({ success: false, error: 'Eliminated players cannot vote' });
        return;
      }

      // Check if player already voted
      const existingVote = room.votingResults.find(v => v.voterId === socket.id);
      if (existingVote) {
        callback({ success: false, error: 'You have already voted' });
        return;
      }

      // Check if suspected player exists
      const suspectedPlayer = room.players.find(p => p.id === suspectedMindlessId);
      if (!suspectedPlayer) {
        callback({ success: false, error: 'Invalid player selection' });
        return;
      }

      // Add vote
      room.votingResults.push({
        voterId: socket.id,
        suspectedMindlessId: suspectedMindlessId
      });

      // Check if all active players have voted
      const activePlayers = room.players.filter(p => p.status !== 'eliminated');
      if (room.votingResults.length === activePlayers.length) {
        // Store original player list before elimination
        const originalPlayers = [...room.players];
        
        // Calculate results and determine elimination
        const results = calculateScores(room);
        
        // Store the current voting results in the room state
        room.currentVotingResults = results;
        
        // Add to game history
        room.gameHistory.push({
          theme: room.currentTheme,
          eliminatedPlayer: results.eliminatedPlayer.name,
          mindlessPlayer: results.mindlessPlayer,
          gameEnded: results.gameEnded,
          timestamp: new Date()
        });
        
        if (results.gameEnded) {
          // Game is over
          room.gameState = 'finished';
        } else {
          // Game continues - prepare for next round
          room.gameState = 'results';
          room.currentRound = 1;
          room.currentPlayerIndex = 0;
          room.votingResults = [];
          
          // Reset words for remaining players
          room.players.forEach(player => {
            player.words = [];
          });
        }
        
        await room.save();
        
        // Notify all players about results (including eliminated players who stay as observers)
        room.players.forEach(p => {
          const playerSocket = io.sockets.sockets.get(p.id);
          if (playerSocket) {
            const gameStateForPlayer = getGameState(room, p.id);
            playerSocket.emit('results_phase', gameStateForPlayer);
          }
        });
        
      } else {
        // Still waiting for more votes - notify all players
        const activePlayers = room.players.filter(p => p.status !== 'eliminated');
        io.to(connection.roomCode).emit('voting_update', {
          votedCount: room.votingResults.length,
          totalPlayers: activePlayers.length
        });
        
        await room.save();
      }

      callback({ success: true });
      
    } catch (error) {
      console.error('Error voting:', error);
      callback({ success: false, error: 'Failed to vote' });
    }
  });

  // Handle starting next round/rematch
  socket.on('next_round', async (callback) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection || !connection.roomCode) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode: connection.roomCode });
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      // Check if player is host
      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        callback({ success: false, error: 'Only host can start next round' });
        return;
      }

      if (room.gameState !== 'results' && room.gameState !== 'finished') {
        callback({ success: false, error: 'Not in results phase' });
        return;
      }

      // Check if game is finished by looking at the game results
      const gameResults = room.currentVotingResults;
      if (room.gameState === 'finished' || (gameResults && gameResults.gameEnded)) {
        // Start a completely new game - reset all players to active status
        room.players.forEach(player => {
          player.status = 'active';
          player.score = 0;
          player.words = [];
        });
        
        const { theme, concepts, players } = assignRolesAndConcepts(room.players);
        
        room.currentTheme = theme;
        room.concepts = concepts;
        room.players = players;
        room.gameState = 'playing';
        room.currentRound = 1;
        room.currentPlayerIndex = 0;
        room.votingResults = [];
        room.currentVotingResults = null;
      } else {
        // Continue current game with remaining active players
        room.gameState = 'playing';
        room.currentRound = 1;
        
        // Start with first active (non-eliminated) player
        const firstActivePlayerIndex = room.players.findIndex(p => p.status !== 'eliminated');
        room.currentPlayerIndex = firstActivePlayerIndex >= 0 ? firstActivePlayerIndex : 0;
        
        room.votingResults = [];
        room.currentVotingResults = null;
        
        // Reset words for all players but keep eliminated status
        room.players.forEach(player => {
          player.words = [];
        });
      }

      await room.save();

      callback({ success: true });
      
      // Notify all players
      room.players.forEach(p => {
        const playerSocket = io.sockets.sockets.get(p.id);
        if (playerSocket) {
          playerSocket.emit('game_started', getGameState(room, p.id));
        }
      });
      
    } catch (error) {
      console.error('Error starting next round:', error);
      callback({ success: false, error: 'Failed to start next round' });
    }
  });

  // Handle getting current game state
  socket.on('get_game_state', async (callback) => {
    try {
      const connection = activeConnections.get(socket.id);
      if (!connection || !connection.roomCode) {
        callback({ success: false, error: 'Not in a room' });
        return;
      }

      const room = await GameRoom.findOne({ roomCode: connection.roomCode });
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      callback({ 
        success: true, 
        gameState: getGameState(room, socket.id) 
      });
      
    } catch (error) {
      console.error('Error getting game state:', error);
      callback({ success: false, error: 'Failed to get game state' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const connection = activeConnections.get(socket.id);
      if (connection && connection.roomCode) {
        const room = await GameRoom.findOne({ roomCode: connection.roomCode });
        if (room) {
          // Remove player from room
          room.players = room.players.filter(p => p.id !== socket.id);
          
          // If no players left, delete room
          if (room.players.length === 0) {
            await room.deleteOne();
          } else {
            // If host left, assign new host
            if (!room.players.find(p => p.isHost)) {
              room.players[0].isHost = true;
            }
            
            // If game was in progress and not enough players, reset to waiting
            if (room.players.length < 4 && room.gameState === 'playing') {
              room.gameState = 'waiting';
            }
            
            await room.save();
            
            // Notify remaining players
            room.players.forEach(p => {
              const playerSocket = io.sockets.sockets.get(p.id);
              if (playerSocket) {
                playerSocket.emit('room_update', getGameState(room, p.id));
              }
            });
          }
        }
      }
      
      // Remove from active connections
      activeConnections.delete(socket.id);
      
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
};

module.exports = gameHandler; 