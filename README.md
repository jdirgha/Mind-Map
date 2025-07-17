# Mind Map - Multiplayer Game

A fun multiplayer word game where players submit words related to a theme, and one "mindless" player tries to blend in without knowing the theme!

## 🎯 How to Play

1. **Join a Room**: Create or join a game room (4-10 players)
2. **Get Your Role**: You're either a "concept" player (know the theme) or "mindless" (don't know the theme)
3. **Submit Words**: Each player submits words for 2 rounds
4. **Vote**: Vote for who you think is the mindless player
5. **Win**: Concept players win if they eliminate the mindless player, mindless wins if they survive!

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ and npm
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/mind-map-game.git
cd mind-map-game

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Run the Game
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend client
cd client
npm run dev
```

Visit `http://localhost:5173` to play!

## 🌐 Deploy to Production

Ready to share your game with the world? Follow comprehensive deployment guide:

**👉 [DEPLOYMENT.md](DEPLOYMENT.md)**

The guide covers:
- Free deployment to Render (backend) and Netlify (frontend)
- Environment configuration
- Custom domain setup
- Troubleshooting tips

## 🏗️ Project Structure

```
mind-map-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Game components
│   │   ├── services/      # Socket.IO client
│   │   └── App.jsx        # Main app
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Game room models
│   ├── gameHandler.js     # Socket.IO handlers
│   ├── gameLogic.js       # Game rules & logic
│   └── index.js           # Server entry point
├── shared/                 # Shared data
│   └── themes.json        # Game themes
└── DEPLOYMENT.md          # Deployment guide
```

## Game Features

- **Real-time Multiplayer**: Socket.IO for instant updates
- **Responsive Design**: Play on desktop or mobile
- **Theme Variety**: Multiple themes and concepts
- **Elimination System**: Progressive player elimination
- **Observer Mode**: Eliminated players can watch
- **Room Management**: Create and join rooms with codes

## 🔧 Tech Stack

**Frontend:**
- React 18
- Vite
- Socket.IO Client
- Tailwind CSS

**Backend:**
- Node.js
- Express
- Socket.IO
- In-memory storage (easily upgradeable to MongoDB)

## Environment Variables

### Backend (`server/.env`)
```
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```
VITE_SERVER_URL=http://localhost:3001
```

## 🎯 Game Rules

1. **Setup**: 4-10 players, one randomly chosen as "mindless"
2. **Theme**: Everyone except mindless player sees the theme
3. **Rounds**: 2 rounds of word submission
4. **Voting**: Players vote for who they think is mindless
5. **Elimination**: Player with most votes is eliminated
6. **Win Conditions**:
   - Concept players win if mindless is eliminated
   - Mindless wins if they survive to the end

## 🆘 Troubleshooting

**Connection Issues:**
- Check if both servers are running
- Verify ports 3001 and 5173 are available
- Check browser console for errors

**Game Issues:**
- Refresh the page and rejoin
- Check network connection
- Try a different browser

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Start Playing!

Whether you're running locally or deploying to production, your Mind Map game is ready to provide hours of fun with friends!

**Local**: http://localhost:5173
**Deployed**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) to get your live URL

