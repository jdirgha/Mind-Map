import { io } from 'socket.io-client';

// Get server URL from environment variables
const getServerUrl = () => {
  // In production, use the backend URL from environment variables
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_SERVER_URL || 
           'https://your-render-app.onrender.com';
  }
  // In development, use localhost
  return import.meta.env.VITE_SERVER_URL || 
         'http://localhost:3001';
};

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = getServerUrl();
    this.eventListeners = new Map();
    console.log('🌐 Socket service initialized with server URL:', this.serverUrl);
  }

  // Simple event emitter methods
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        callback(...args);
      });
    }
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 10000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to server:', this.serverUrl);
          this.setupEventListeners();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          reject(new Error(`Failed to connect to server: ${error.message}`));
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from server:', reason);
          this.emit('disconnected', reason);
        });

      } catch (error) {
        console.error('❌ Socket initialization error:', error);
        reject(error);
      }
    });
  }

  setupEventListeners() {
    // Room events
    this.socket.on('room_update', (gameState) => {
      this.emit('room_update', gameState);
    });

    this.socket.on('game_started', (gameState) => {
      this.emit('game_started', gameState);
    });

    this.socket.on('game_update', (gameState) => {
      this.emit('game_update', gameState);
    });

    this.socket.on('voting_phase', (gameState) => {
      this.emit('voting_phase', gameState);
    });

    this.socket.on('voting_update', (data) => {
      this.emit('voting_update', data);
    });

    this.socket.on('results_phase', (gameState) => {
      this.emit('results_phase', gameState);
    });

    this.socket.on('player_eliminated', (data) => {
      this.emit('player_eliminated', data);
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Reconnected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket disconnected');
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Game actions
  createRoom(playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('create_room', playerName, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  joinRoom(roomCode, playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join_room', roomCode, playerName, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  startGame() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('start_game', (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  submitWord(word) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('submit_word', word, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  vote(suspectedMindlessId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('vote', suspectedMindlessId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  nextRound() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('next_round', (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  getGameState() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('get_game_state', (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }
}

export default new SocketService(); 