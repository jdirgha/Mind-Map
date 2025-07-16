// In-memory storage implementation for development
class GameRoom {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = [];
    this.gameState = 'waiting'; // waiting, playing, voting, results
    this.currentRound = 1;
    this.maxRounds = 2;
    this.currentTheme = null;
    this.currentPlayerIndex = 0;
    this.playerConcepts = new Map();
    this.submittedWords = new Map();
    this.votes = new Map();
    this.scores = new Map();
    this.mindlessPlayer = null;
    this.votingResults = [];
    this.currentVotingResults = null;
    this.gameHistory = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Static methods to mimic MongoDB operations
  static async findOne(query) {
    const rooms = global.inMemoryRooms || new Map();
    if (query.roomCode) {
      return rooms.get(query.roomCode) || null;
    }
    return null;
  }

  static async create(roomData) {
    const rooms = global.inMemoryRooms || new Map();
    const room = new GameRoom(roomData.roomCode);
    rooms.set(roomData.roomCode, room);
    global.inMemoryRooms = rooms;
    return room;
  }

  async save() {
    const rooms = global.inMemoryRooms || new Map();
    this.updatedAt = new Date();
    rooms.set(this.roomCode, this);
    global.inMemoryRooms = rooms;
    return this;
  }

  async deleteOne() {
    const rooms = global.inMemoryRooms || new Map();
    rooms.delete(this.roomCode);
    global.inMemoryRooms = rooms;
    return this;
  }

  // Generate unique room code
  static generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Instance method to advance to next player (skip eliminated players)
  nextPlayer() {
    const activePlayers = this.players.filter(p => p.status !== 'eliminated');
    if (activePlayers.length === 0) return;
    
    let attempts = 0;
    const maxAttempts = this.players.length;
    
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      attempts++;
      
      // Prevent infinite loop
      if (attempts >= maxAttempts) {
        console.error('Unable to find next active player');
        break;
      }
    } while (this.players[this.currentPlayerIndex].status === 'eliminated');
    
    // Check if we've completed a round by checking if all active players have submitted words for the current round
    const allActivePlayersSubmitted = activePlayers.every(player => {
      return player.words.some(word => word.round === this.currentRound);
    });
    
    if (allActivePlayersSubmitted) {
      this.currentRound++;
    }
  }

  // Check if game can start (4-10 players and in waiting state)
  canStartGame() {
    return this.players.length >= 4 && this.players.length <= 10 && this.gameState === 'waiting';
  }

  // Get current player whose turn it is (only active players)
  getCurrentPlayer() {
    if (this.players.length === 0) return null;
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    // If current player is eliminated, find next active player
    if (currentPlayer && currentPlayer.status === 'eliminated') {
      this.nextPlayer();
      return this.players[this.currentPlayerIndex];
    }
    
    return currentPlayer;
  }
}

module.exports = GameRoom; 