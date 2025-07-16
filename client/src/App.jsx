import { useState, useEffect } from 'react';
import socketService from './services/socket';
import HomePage from './components/HomePage';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import VotingScreen from './components/VotingScreen';
import ResultsScreen from './components/ResultsScreen';
import LoadingScreen from './components/LoadingScreen';
import ParticleBackground from './components/ParticleBackground';

function App() {
  const [gameState, setGameState] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Set up socket event listeners
    socketService.on('room_update', handleRoomUpdate);
    socketService.on('game_started', handleGameStarted);
    socketService.on('game_update', handleGameUpdate);
    socketService.on('voting_phase', handleVotingPhase);
    socketService.on('voting_update', handleVotingUpdate);
    socketService.on('results_phase', handleResultsPhase);
    socketService.on('player_eliminated', handlePlayerEliminated);
    socketService.on('disconnected', handleDisconnected);

    return () => {
      // Clean up event listeners
      socketService.off('room_update', handleRoomUpdate);
      socketService.off('game_started', handleGameStarted);
      socketService.off('game_update', handleGameUpdate);
      socketService.off('voting_phase', handleVotingPhase);
      socketService.off('voting_update', handleVotingUpdate);
      socketService.off('results_phase', handleResultsPhase);
      socketService.off('player_eliminated', handlePlayerEliminated);
      socketService.off('disconnected', handleDisconnected);
    };
  }, []);

  const handleRoomUpdate = (newGameState) => {
    setGameState(newGameState);
    if (newGameState.status === 'waiting') {
      setCurrentScreen('lobby');
    }
  };

  const handleGameStarted = (newGameState) => {
    setGameState(newGameState);
    setCurrentScreen('game');
  };

  const handleGameUpdate = (newGameState) => {
    setGameState(newGameState);
    setCurrentScreen('game');
  };

  const handleVotingPhase = (newGameState) => {
    setGameState(newGameState);
    setCurrentScreen('voting');
  };

  const handleVotingUpdate = (data) => {
    // Update voting progress without changing screen
    setGameState(prev => ({
      ...prev,
      votingProgress: data
    }));
  };

  const handleResultsPhase = (newGameState) => {
    setGameState(newGameState);
    setCurrentScreen('results');
  };

  const handlePlayerEliminated = (data) => {
    setError(`You have been eliminated from the game. ${data.reason}`);
    setCurrentScreen('home');
    setGameState(null);
  };

  const handleDisconnected = (reason) => {
    setConnectionStatus('disconnected');
    setError('Connection lost. Please refresh the page to reconnect.');
    setCurrentScreen('home');
  };

  const connectToServer = async () => {
    if (socketService.isConnected()) {
      setConnectionStatus('connected');
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      await socketService.connect();
      setConnectionStatus('connected');
    } catch (error) {
      setError(`Failed to connect to server: ${error.message}`);
      setConnectionStatus('disconnected');
    } finally {
      setIsConnecting(false);
    }
  };

  const createRoom = async (playerName) => {
    try {
      await connectToServer();
      const response = await socketService.createRoom(playerName);
      setGameState(response.gameState);
      setCurrentScreen('lobby');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const joinRoom = async (roomCode, playerName) => {
    try {
      await connectToServer();
      const response = await socketService.joinRoom(roomCode, playerName);
      setGameState(response.gameState);
      setCurrentScreen('lobby');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const startGame = async () => {
    try {
      await socketService.startGame();
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const submitWord = async (word) => {
    try {
      await socketService.submitWord(word);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const vote = async (suspectedMindlessId) => {
    try {
      await socketService.vote(suspectedMindlessId);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const nextRound = async () => {
    try {
      await socketService.nextRound();
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const goHome = () => {
    socketService.disconnect();
    setGameState(null);
    setCurrentScreen('home');
    setConnectionStatus('disconnected');
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  if (isConnecting) {
    return <LoadingScreen message="Connecting to server..." />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Error Banner */}
      {error && (
        <div className="bg-gradient-to-r from-danger-600 to-danger-700 text-white px-4 py-3 relative shadow-lg" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={clearError}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-danger-800 transition-colors rounded-r"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Connection Status */}
      <div className="glass backdrop-blur-md mx-4 mt-4 rounded-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-sm text-white font-medium">
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {gameState && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-white">
                Room: <span className="font-bold text-yellow-300">{gameState.roomCode}</span>
              </span>
              <span className={`status-badge ${gameState.status}`}>
                {gameState.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentScreen === 'home' && (
          <HomePage 
            onCreateRoom={createRoom} 
            onJoinRoom={joinRoom}
            isConnecting={isConnecting}
          />
        )}
        
        {currentScreen === 'lobby' && gameState && (
          <LobbyScreen 
            gameState={gameState}
            onStartGame={startGame}
            onGoHome={goHome}
          />
        )}
        
        {currentScreen === 'game' && gameState && (
          <GameScreen 
            gameState={gameState}
            onSubmitWord={submitWord}
            onGoHome={goHome}
          />
        )}
        
        {currentScreen === 'voting' && gameState && (
          <VotingScreen 
            gameState={gameState}
            onVote={vote}
            onGoHome={goHome}
          />
        )}
        
        {currentScreen === 'results' && gameState && (
          <ResultsScreen 
            gameState={gameState}
            onNextRound={nextRound}
            onGoHome={goHome}
          />
        )}
      </div>
    </div>
  );
}

export default App; 