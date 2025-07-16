const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const gameHandler = require('./gameHandler');

const app = express();
const server = http.createServer(app);

// Get port from environment or default to 3001
const PORT = process.env.PORT || 3001;

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.CLIENT_URL,
        // Add additional allowed origins for production
        'https://your-netlify-app.netlify.app',
        'https://your-custom-domain.com'
      ]
    : ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    name: 'Mind Map Game Server', 
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// In-memory storage for development and production
// For production, you might want to use Redis or MongoDB
global.inMemoryRooms = new Map();

if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Running in production mode');
  console.log('📡 CORS origins:', corsOptions.origin);
} else {
  console.log('🛠️  Running in development mode');
  console.log('📡 Using in-memory storage for development');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Initialize game handler for this socket
  gameHandler(io, socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🎮 Mind Map Game Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io }; 