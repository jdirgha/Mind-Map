import { useState } from 'react';

function LobbyScreen({ gameState, onStartGame, onGoHome }) {
  const [isStarting, setIsStarting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const isHost = gameState.players.find(p => p.id === gameState.players[0]?.id)?.isHost;
  const canStart = gameState.players.length >= 4 && gameState.players.length <= 10;

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      await onStartGame();
    } finally {
      setIsStarting(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="game-header">
        <h1 className="text-3xl font-bold mb-2">Game Lobby</h1>
        <p className="text-primary-100">
          Waiting for players to join...
        </p>
      </div>

      {/* Room Code */}
      <div className="card mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Room Code</h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl font-mono font-bold text-primary-600 tracking-wider">
              {gameState.roomCode}
            </span>
            <button
              onClick={copyRoomCode}
              className={`btn shadow-lg transition-all duration-300 ${
                copySuccess 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'btn-secondary hover:bg-primary-600'
              }`}
              title={copySuccess ? "Copied!" : "Copy room code"}
            >
              {copySuccess ? (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this code with friends to join the game
          </p>
        </div>
      </div>

      {/* Players List */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Players ({gameState.players.length}/10)
          </h2>
          <div className="flex items-center space-x-2">
            {canStart ? (
              <div className="flex items-center text-green-600">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Ready to start</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium">
                  Need {Math.max(0, 4 - gameState.players.length)} more players
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gameState.players.map((player, index) => (
            <div key={player.id} className="player-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {player.isHost ? 'Host' : 'Player'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {player.isHost && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Host
                    </div>
                  )}
                  <div className="w-3 h-3 bg-green-500 rounded-full" title="Online"></div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty slots */}
          {gameState.players.length < 10 && (
            <div className="player-card border-dashed border-gray-300 bg-gray-50">
              <div className="flex items-center justify-center h-16 text-gray-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Info */}
      <div className="card mb-6 hover-glow">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Game Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center hover:bg-purple-50 p-3 rounded-lg transition-colors">
            <span className="text-2xl mr-3">🎲</span>
            <span className="text-gray-800 font-medium">Random theme selection</span>
          </div>
          <div className="flex items-center hover:bg-purple-50 p-3 rounded-lg transition-colors">
            <span className="text-2xl mr-3">🔄</span>
            <span className="text-gray-800 font-medium">2 rounds of words</span>
          </div>
          <div className="flex items-center hover:bg-purple-50 p-3 rounded-lg transition-colors">
            <span className="text-2xl mr-3">🎭</span>
            <span className="text-gray-800 font-medium">One secret mindless player</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onGoHome}
          className="btn btn-outline"
        >
          Leave Game
        </button>

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={!canStart || isStarting}
            className="btn btn-primary"
          >
            {isStarting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting Game...
              </span>
            ) : (
              'Start Game'
            )}
          </button>
        )}

        {!isHost && (
          <div className="text-sm text-gray-500">
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}

export default LobbyScreen; 