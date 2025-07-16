import { useState, useEffect } from 'react';

function GameScreen({ gameState, onSubmitWord, onGoHome }) {
  const [currentWord, setCurrentWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = gameState.isPlayerTurn;
  // Use the current player status provided by the server
  const isEliminated = gameState.currentPlayerStatus === 'eliminated';

  const handleSubmitWord = async (e) => {
    e.preventDefault();
    if (!currentWord.trim() || !isMyTurn || isEliminated) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitWord(currentWord.trim());
      setCurrentWord('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWordChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').toLowerCase();
    if (value.length <= 30) {
      setCurrentWord(value);
    }
  };

  // Auto-focus input when it's the player's turn (but not if eliminated)
  useEffect(() => {
    if (isMyTurn && !isEliminated) {
      const input = document.getElementById('word-input');
      if (input) {
        input.focus();
      }
    }
  }, [isMyTurn, isEliminated]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="game-header">
        <h1 className="text-3xl font-bold mb-2">Mind Map</h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-primary-100">
            <span className="font-semibold">Round: </span>
            <span className="text-xl">{gameState.currentRound}/{gameState.maxRounds}</span>
          </div>
        </div>
      </div>

      {/* Theme Section - More Prominent */}
      <div className="card mb-6 hover-glow relative overflow-hidden">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Game Theme
          </h2>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl px-6 py-6 shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-75"></div>
            <div className="relative z-10">
              <p className="text-4xl font-bold text-white mb-2 animate-pulse-slow">{gameState.theme}</p>
              <p className="text-purple-100 text-sm">
                🎯 Give words that relate to this theme and your concept
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Player's Role Info */}
      <div className="card mb-6 hover-glow">
        <div className="text-center">
          {gameState.playerRole === 'concept' ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-green-800">Your Concept</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                <p className="text-3xl font-bold text-green-900 mb-2">{gameState.playerConcept}</p>
              </div>
              <p className="text-sm text-green-700 font-medium">
                💡 Give words that connect to your concept and the theme
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-500 rounded-full p-2 mr-3 animate-pulse">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-red-800">You are Mindless</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                <p className="text-lg text-red-700 mb-3 font-medium">
                  🤔 You don't have a concept! Use the theme above to guess what concepts others might have.
                </p>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-red-600 mb-2">
                    👂 Listen to others' words and try to give words that fit the theme without being too obvious.
                  </p>
                  <p className="text-sm text-red-500 font-medium">
                    💡 Strategy: Think of words that relate to the theme but aren't too specific to any one concept.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spectator Notice for Eliminated Players */}
      {isEliminated && (
        <div className="card mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-lg font-semibold text-yellow-800">
                You have been eliminated and are now spectating the game
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-2 text-center">
              You can watch the remaining players continue the game until it ends
            </p>
          </div>
        </div>
      )}

      {/* Current Turn */}
      <div className="card mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Current Turn</h2>
          
          {isMyTurn && !isEliminated ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-xl font-semibold text-blue-800">Your Turn!</span>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Enter one word that relates to your concept and the theme
                </p>
              </div>
              
              <form onSubmit={handleSubmitWord} className="space-y-4">
                <div>
                  <input
                    id="word-input"
                    type="text"
                    value={currentWord}
                    onChange={handleWordChange}
                    className="input text-center text-xl font-semibold"
                    placeholder="Enter your word..."
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {currentWord.length}/30 characters
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!currentWord.trim() || isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Word'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">
                    {currentPlayer?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-900">{currentPlayer?.name}</p>
                  <p className="text-sm text-gray-500">is thinking...</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Players and Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {gameState.players.map((player, index) => (
          <div 
            key={player.id} 
            className={`player-card ${
              index === gameState.currentPlayerIndex ? 'active' : ''
            } ${player.status === 'eliminated' ? 'bg-red-50 border-red-200 opacity-75' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-500">
                    {player.status === 'eliminated' ? 'Eliminated' : 
                     player.isHost ? 'Host' : 'Player'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                {index === gameState.currentPlayerIndex && player.status !== 'eliminated' && (
                  <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                    Current Turn
                  </div>
                )}
                {player.status === 'eliminated' && (
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    Eliminated
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Words:</p>
              <div className="min-h-12">
                {player.words.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {player.words.map((wordObj, wordIndex) => (
                      <div key={wordIndex} className="word-bubble">
                        {wordObj.word}
                        <span className="text-xs text-primary-600 ml-1">
                          R{wordObj.round}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm italic">No words yet</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Game Progress</h3>
          <span className="text-sm text-gray-500">
            {gameState.currentRound > gameState.maxRounds ? 
              'Moving to voting...' : 
              `Round ${gameState.currentRound} of ${gameState.maxRounds}`
            }
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (gameState.currentRound / gameState.maxRounds) * 100)}%` 
            }}
          />
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
        
        <div className="text-sm text-gray-500">
          {gameState.currentRound > gameState.maxRounds ? 
            'Preparing for voting phase...' : 
            `${gameState.players.length - gameState.players.filter(p => p.words.length >= gameState.currentRound).length} players left this round`
          }
        </div>
      </div>
    </div>
  );
}

export default GameScreen; 