import { useState } from 'react';

function ResultsScreen({ gameState, onNextRound, onGoHome }) {
  const [isStartingNext, setIsStartingNext] = useState(false);

  // Safety check to prevent blank screens
  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Loading Results...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const mindlessPlayer = gameState.players.find(p => p.role === 'mindless');
  const isHost = gameState.players.some(p => p.isHost);
  const gameResults = gameState.gameResults;
  const isGameFinished = gameState.status === 'finished' || (gameResults && gameResults.gameEnded);
  
  const handleNextRound = async () => {
    setIsStartingNext(true);
    try {
      await onNextRound();
    } finally {
      setIsStartingNext(false);
    }
  };

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="game-header">
        <h1 className="text-3xl font-bold mb-2">
          {isGameFinished ? 'Game Over!' : 'Round Results'}
        </h1>
        <p className="text-primary-100">
          {isGameFinished ? 
            (gameResults?.mindlessEliminated ? 
              'The mindless player has been found!' : 
              'The mindless player wins!') : 
            'A player has been eliminated - Game continues!'
          }
        </p>
      </div>

      {/* Elimination Results */}
      {gameResults ? (
        <div className="card mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {gameResults.noElimination ? 
                'No Elimination - Tie Vote!' :
                (gameResults.gameEnded ? 
                  (gameResults.mindlessEliminated ? 
                    'Game Over - Mindless Player Found!' : 
                    'Game Over - Mindless Player Wins!') : 
                  'Player Eliminated'
                )
              }
            </h2>
            
            {gameResults.noElimination ? (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-2xl">⚖️</span>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-yellow-900">Tie Vote</p>
                    <p className="text-yellow-700">No player eliminated</p>
                  </div>
                </div>
                
                <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Players with most votes:</strong> {gameResults.playersWithMaxVotes.join(', ')} ({gameResults.maxVotes} votes each)
                  </p>
                  <p className="text-sm mt-1 text-yellow-800">
                    <strong>Result:</strong> No elimination due to tie - Game continues with all players!
                  </p>
                </div>
              </div>
            ) : (
              <div className={`rounded-lg p-6 mb-4 ${
                gameResults.gameEnded 
                  ? (gameResults.mindlessEliminated ? 
                      'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 
                      'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200') 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                    gameResults.gameEnded
                      ? (gameResults.mindlessEliminated ? 
                          'bg-gradient-to-br from-green-500 to-emerald-500' : 
                          'bg-gradient-to-br from-purple-500 to-indigo-500')
                      : 'bg-gradient-to-br from-red-500 to-pink-500'
                  }`}>
                    <span className="text-white font-bold text-2xl">
                      {gameResults.eliminatedPlayer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className={`text-2xl font-bold ${
                      gameResults.gameEnded ? 
                        (gameResults.mindlessEliminated ? 'text-green-900' : 'text-purple-900') : 
                        'text-red-900'
                    }`}>
                      {gameResults.eliminatedPlayer.name}
                    </p>
                    <p className={gameResults.gameEnded ? 
                      (gameResults.mindlessEliminated ? 'text-green-700' : 'text-purple-700') : 
                      'text-red-700'
                    }>
                      {gameResults.gameEnded && gameResults.eliminatedPlayer.role === 'mindless' ? 'The Mindless Player' : 'Eliminated Player'}
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-lg p-4 mb-4 ${
                  gameResults.gameEnded ? 
                    (gameResults.mindlessEliminated ? 'bg-green-100' : 'bg-purple-100') : 
                    'bg-red-100'
                }`}>
                  <p className={`text-sm ${
                    gameResults.gameEnded ? 
                      (gameResults.mindlessEliminated ? 'text-green-800' : 'text-purple-800') : 
                      'text-red-800'
                  }`}>
                    <strong>Votes received:</strong> {gameResults.eliminatedPlayer.votes} out of {gameResults.totalVotes}
                  </p>
                  <p className={`text-sm mt-1 ${
                    gameResults.gameEnded ? 
                      (gameResults.mindlessEliminated ? 'text-green-800' : 'text-purple-800') : 
                      'text-red-800'
                  }`}>
                    <strong>Result:</strong> {gameResults.gameEnded 
                      ? (gameResults.mindlessEliminated ? 
                          'Mindless player found - Concept players win!' : 
                          gameResults.isFinalRound ? 
                            'Final round completed - Mindless player wins!' :
                            `Only ${gameResults.remainingPlayers} players remain - Mindless player wins!`) 
                      : 'Wrong player eliminated - Game continues!'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Loading Results...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Mindless Player Reveal - Only show when game has ended */}
      {isGameFinished && (
        <div className="card mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">The Mindless Player Is...</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">
                    {mindlessPlayer?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-blue-900">{mindlessPlayer?.name}</p>
                  <p className="text-blue-700">The Mindless Player</p>
                </div>
              </div>
              
              <div className="bg-blue-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Theme:</strong> {gameState.theme}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Their words:</strong> {' '}
                  {mindlessPlayer?.words.map(w => w.word).join(', ') || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Results */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Voting Results</h3>
        
        <div className="space-y-3">
          {gameState.players.map((player) => (
            <div 
              key={player.id} 
              className={`player-card ${
                player.status === 'eliminated' ? 'bg-red-50 border-red-200 opacity-75' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-lg">{player.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {player.words.map((wordObj, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {wordObj.word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg font-bold text-gray-900">
                      {player.votes} vote{player.votes !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-col space-y-1">
                      {player.status === 'eliminated' && (
                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          Eliminated
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Status */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Game Status</h3>
        
        <div className={`rounded-lg p-4 ${
          isGameFinished 
            ? (gameResults?.mindlessEliminated ? 
                'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 
                'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200') 
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
        }`}>
          {isGameFinished ? (
            <div className="text-center">
              {gameResults?.mindlessEliminated ? (
                <>
                  <h4 className="text-lg font-semibold text-green-900 mb-2">🎉 Concept Players Win!</h4>
                  <p className="text-green-800">
                    The mindless player has been found and eliminated. Great detective work!
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-purple-900 mb-2">🎭 Mindless Player Wins!</h4>
                  <p className="text-purple-800">
                    {gameResults?.isFinalRound ? 
                      'Final round completed with 3 players. The mindless player has successfully blended in!' :
                      `Only ${gameResults?.remainingPlayers || 3} players remain. The mindless player has successfully blended in!`
                    }
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h4 className="text-lg font-semibold text-yellow-900 mb-2">🔄 Game Continues!</h4>
              <p className="text-yellow-800">
                Wrong player eliminated. The mindless player is still among the remaining {gameState.players.length} players.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                The game will continue with another round of word submission and voting until the mindless player is found or there are only 3 players left (final round).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scoring & Leaderboard - Only show when game is finished */}
      {isGameFinished && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Final Scoring & Leaderboard</h3>
          
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{player.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {player.score} point{player.score !== 1 ? 's' : ''}
                  </div>
                  {index === 0 && player.score > 0 && (
                    <div className="text-sm text-yellow-700 font-medium">
                      🏆 Winner
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onGoHome}
          className="btn btn-outline"
        >
          End Game
        </button>

        {isHost && (
          <button
            onClick={handleNextRound}
            disabled={isStartingNext}
            className="btn btn-primary"
          >
            {isStartingNext ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isGameFinished ? 'Starting New Game...' : 'Starting Next Round...'}
              </span>
            ) : (
              isGameFinished ? 'New Game' : 'Continue to Next Round'
            )}
          </button>
        )}

        {!isHost && (
          <div className="text-sm text-gray-500">
            {isGameFinished ? 'Waiting for host to start new game...' : 'Waiting for host to continue with next round...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsScreen; 