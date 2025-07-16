const fs = require('fs');
const path = require('path');
const GameRoom = require('./models/GameRoom');

// Load themes from JSON file
const loadThemes = () => {
  try {
    const themesPath = path.join(__dirname, '../shared/themes.json');
    const themesData = fs.readFileSync(themesPath, 'utf8');
    return JSON.parse(themesData);
  } catch (error) {
    console.error('Error loading themes:', error);
    // Fallback theme data
    return {
      themes: [{
        name: "Animals",
        concepts: ["Dog", "Cat", "Lion", "Tiger", "Bird", "Fish", "Elephant", "Horse", "Rabbit", "Bear"]
      }]
    };
  }
};

// Get random theme and concepts
const getRandomTheme = () => {
  const { themes } = loadThemes();
  const randomIndex = Math.floor(Math.random() * themes.length);
  return themes[randomIndex];
};

// Assign roles and concepts to players
const assignRolesAndConcepts = (players) => {
  if (players.length < 4) {
    throw new Error('Not enough players to start game');
  }
  
  // Get random theme
  const theme = getRandomTheme();
  
  // Shuffle concepts
  const shuffledConcepts = [...theme.concepts].sort(() => Math.random() - 0.5);
  
  // Randomly select one player to be mindless
  const mindlessIndex = Math.floor(Math.random() * players.length);
  
  // Create concepts array for game room (includes null for mindless player)
  const gameConcepts = [];
  let conceptIndex = 0;
  
  // Assign roles and concepts
  const updatedPlayers = players.map((player, index) => {
    if (index === mindlessIndex) {
      gameConcepts.push(null);
      return {
        ...player,
        role: 'mindless',
        concept: null,
        words: [],
        votes: 0
      };
    } else {
      const concept = shuffledConcepts[conceptIndex];
      gameConcepts.push(concept);
      conceptIndex++;
      return {
        ...player,
        role: 'concept',
        concept: concept,
        words: [],
        votes: 0
      };
    }
  });
  
  return {
    theme: theme.name,
    concepts: gameConcepts,
    players: updatedPlayers
  };
};

// Calculate scores after voting
const calculateScores = (room) => {
  const mindlessPlayer = room.players.find(p => p.role === 'mindless');
  if (!mindlessPlayer) return;
  
  // Count votes for each player
  const voteCount = {};
  room.players.forEach(player => {
    voteCount[player.id] = 0;
  });
  
  room.votingResults.forEach(vote => {
    if (voteCount[vote.suspectedMindlessId] !== undefined) {
      voteCount[vote.suspectedMindlessId]++;
    }
  });
  
  // Update vote counts in player objects
  room.players.forEach(player => {
    player.votes = voteCount[player.id] || 0;
  });
  
  // Find the player(s) with the most votes
  const mindlessVotes = voteCount[mindlessPlayer.id] || 0;
  const totalVotes = room.votingResults.length;
  const maxVotes = Math.max(...Object.values(voteCount));
  
  // Find all players with maximum votes (for tie handling)
  const playersWithMaxVotes = room.players.filter(p => voteCount[p.id] === maxVotes);
  
    // Check for ties - if multiple players have max votes, no elimination
  const isTie = playersWithMaxVotes.length > 1;
  
  let eliminatedPlayer = null;
  let gameEnded = false;
  let noElimination = false;
  
  // Check if this is the final round (3 active players at start of voting)
  const activePlayers = room.players.filter(p => p.status !== 'eliminated');
  const isFinalRound = activePlayers.length === 3;
  
  if (isTie) {
    // Tie - no one gets eliminated, game continues
    noElimination = true;
    gameEnded = false;
    eliminatedPlayer = null;
  } else {
    // Clear winner with most votes
    const playerWithMostVotes = playersWithMaxVotes[0];
    const mindlessEliminated = playerWithMostVotes.id === mindlessPlayer.id;
    
    if (mindlessEliminated) {
      // Mindless player eliminated - Game ends, remaining players win
      eliminatedPlayer = mindlessPlayer;
      gameEnded = true;
      
      // Award 1 point to each surviving player (concept players who found mindless)
      room.players.forEach(player => {
        if (player.role !== 'mindless' && player.status !== 'eliminated') {
          player.score += 1;
        }
      });
    } else {
      // Someone else eliminated
      eliminatedPlayer = playerWithMostVotes;
      
      if (isFinalRound) {
        // Final round with 3 players - mindless wins because they weren't eliminated
        gameEnded = true;
        mindlessPlayer.score += 1;
      } else {
        // Mark player as eliminated but keep them in room as observer
        eliminatedPlayer.status = 'eliminated';
        gameEnded = false;
      }
    }
  }
  
  return {
    mindlessPlayer: mindlessPlayer.name,
    eliminatedPlayer: eliminatedPlayer ? {
      id: eliminatedPlayer.id,
      name: eliminatedPlayer.name,
      role: eliminatedPlayer.role,
      votes: eliminatedPlayer.votes
    } : null,
    gameEnded,
    mindlessEliminated: eliminatedPlayer ? eliminatedPlayer.id === mindlessPlayer.id : false,
    noElimination,
    isTie,
    totalVotes,
    mindlessVotes,
    maxVotes,
    voteCount,
    playersWithMaxVotes: playersWithMaxVotes.map(p => p.name),
    remainingPlayers: room.players.filter(p => p.status !== 'eliminated').length,
    isFinalRound
  };
};

// Generate unique room code
const generateRoomCode = async () => {
  let roomCode;
  let existingRoom;
  
  do {
    roomCode = GameRoom.generateRoomCode();
    existingRoom = await GameRoom.findOne({ roomCode });
  } while (existingRoom);
  
  return roomCode;
};

// Clean up old/abandoned rooms
const cleanupRooms = async () => {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  try {
    const rooms = global.inMemoryRooms || new Map();
    let deletedCount = 0;
    
    for (const [roomCode, room] of rooms) {
      if (room.updatedAt < cutoffTime && 
          (room.gameState === 'waiting' || room.gameState === 'finished')) {
        rooms.delete(roomCode);
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old rooms`);
  } catch (error) {
    console.error('Error cleaning up rooms:', error);
  }
};

// Validate player word submission
const validateWordSubmission = (word) => {
  if (!word || typeof word !== 'string') {
    return { valid: false, error: 'Word must be a non-empty string' };
  }
  
  const trimmedWord = word.trim();
  if (trimmedWord.length === 0) {
    return { valid: false, error: 'Word cannot be empty' };
  }
  
  if (trimmedWord.length > 30) {
    return { valid: false, error: 'Word must be 30 characters or less' };
  }
  
  // Check for multiple words (simple check)
  if (trimmedWord.includes(' ')) {
    return { valid: false, error: 'Please submit only one word' };
  }
  
  // Check for special characters (allow only letters, numbers, hyphens)
  const validCharacters = /^[a-zA-Z0-9\-]+$/;
  if (!validCharacters.test(trimmedWord)) {
    return { valid: false, error: 'Word contains invalid characters' };
  }
  
  return { valid: true, word: trimmedWord };
};

// Check if game should move to voting phase
const shouldMoveToVoting = (room) => {
  return room.currentRound > room.maxRounds;
};

// Get game state for client
const getGameState = (room, playerId) => {
  const player = room.players.find(p => p.id === playerId);
  const currentPlayerIndex = room.currentPlayerIndex || 0;
  const currentPlayer = room.players[currentPlayerIndex];
  
  // Get the current voting results if available, otherwise fall back to last game result
  const gameResults = room.currentVotingResults || 
    (room.gameHistory.length > 0 ? room.gameHistory[room.gameHistory.length - 1] : null);
  
  return {
    roomCode: room.roomCode,
    theme: room.currentTheme,
    status: room.gameState,
    currentRound: room.currentRound,
    maxRounds: room.maxRounds,
    currentPlayerIndex: currentPlayerIndex,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      role: p.role, // Include role for results display
      words: p.words || [],
      votes: p.votes || 0,
      score: p.score || 0,
      status: p.status || 'active' // active or eliminated
    })),
    currentPlayerId: playerId, // Add current player ID
    currentPlayerStatus: player?.status || 'active', // Add current player status
    playerRole: player?.role,
    playerConcept: player?.concept,
    isPlayerTurn: currentPlayer?.id === playerId,
    votingResults: room.votingResults || [],
    gameResults: gameResults // Include the current voting results
  };
};

module.exports = {
  loadThemes,
  getRandomTheme,
  assignRolesAndConcepts,
  calculateScores,
  generateRoomCode,
  cleanupRooms,
  validateWordSubmission,
  shouldMoveToVoting,
  getGameState
}; 