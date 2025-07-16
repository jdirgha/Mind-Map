import { useState, useEffect } from 'react';

function VotingScreen({ gameState, onVote, onGoHome }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [allVotesIn, setAllVotesIn] = useState(false);

  // Use the current player status provided by the server
  const isEliminated = gameState.currentPlayerStatus === 'eliminated';
  
  // Debug info - can be removed later
  console.log('VotingScreen - Player Status:', {
    currentPlayerStatus: gameState.currentPlayerStatus,
    isEliminated,
    currentPlayerId: gameState.currentPlayerId,
    players: gameState.players.map(p => ({ id: p.id, name: p.name, status: p.status }))
  });

  const handleVote = async () => {
    // Double-check elimination status before voting
    if (!selectedPlayer || hasVoted || isEliminated) {
      console.log('Vote blocked:', { selectedPlayer: !!selectedPlayer, hasVoted, isEliminated });
      return;
    }
    
    setIsVoting(true);
    try {
      await onVote(selectedPlayer.id);
      setHasVoted(true);
    } finally {
      setIsVoting(false);
    }
  };

  const votingProgress = gameState.votingProgress || { votedCount: 0, totalPlayers: gameState.players.filter(p => p.status !== 'eliminated').length };
  
  // Check if all votes are in
  useEffect(() => {
    if (votingProgress.votedCount === votingProgress.totalPlayers && votingProgress.totalPlayers > 0) {
      setAllVotesIn(true);
    }
  }, [votingProgress]);

  // If eliminated, show observer message instead of voting interface
  if (isEliminated) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="game-header">
          <h1 className="text-3xl font-bold mb-2">Voting Phase</h1>
          <p className="text-primary-100">
            You are observing the voting phase
          </p>
        </div>

        {/* Eliminated Player Notice */}
        <div className="card mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <span className="text-red-800 font-medium text-lg">
                  You have been eliminated from the game
                </span>
                <p className="text-red-700 text-sm mt-1">
                  You can watch the remaining players vote, but you cannot participate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Progress for Observers */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Voting Progress</h3>
            <span className="text-sm text-gray-500">
              {votingProgress.votedCount} / {votingProgress.totalPlayers} votes
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(votingProgress.votedCount / votingProgress.totalPlayers) * 100}%` 
              }}
            />
          </div>
          
          {allVotesIn && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800 font-medium">
                  All votes submitted! Calculating results...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Show remaining players for observers */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Remaining Players</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.players.filter(player => player.status !== 'eliminated').map((player) => (
              <div 
                key={player.id}
                className="player-card opacity-75 cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-lg">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.isHost ? 'Host' : 'Player'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Words submitted:</p>
                  {player.words.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {player.words.map((wordObj, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {wordObj.word}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm italic">No words submitted</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onGoHome}
            className="btn btn-outline"
          >
            Leave Game
          </button>
          
          <div className="text-sm text-gray-500">
            {allVotesIn ? 
              'All votes submitted! Calculating results...' : 
              `Waiting for ${votingProgress.totalPlayers - votingProgress.votedCount} more votes`
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="game-header">
        <h1 className="text-3xl font-bold mb-2">Voting Phase</h1>
        <p className="text-primary-100">
          Who do you think is the mindless player?
        </p>
      </div>

      {/* Theme Recap */}
      <div className="card mb-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Theme Recap</h2>
          <p className="text-2xl font-bold text-primary-600 mb-4">{gameState.theme}</p>
          <p className="text-sm text-gray-600">
            Review the words each player submitted and vote for who you think didn't have a concept.
          </p>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="card mb-6">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Voting Progress</h3>
          <span className="text-sm text-gray-500">
            {votingProgress.votedCount} / {votingProgress.totalPlayers} votes
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(votingProgress.votedCount / votingProgress.totalPlayers) * 100}%` 
            }}
          />
        </div>
        
        {hasVoted && !allVotesIn && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">
                Your vote has been submitted! Waiting for other players...
              </span>
            </div>
          </div>
        )}
        
        {allVotesIn && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-800 font-medium">
                All votes submitted! Calculating results...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Players to Vote For */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {hasVoted ? 'Players' : 'Select the Mindless Player'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameState.players.filter(player => player.status !== 'eliminated').map((player) => (
            <div 
              key={player.id}
              className={`player-card transition-all duration-200 ${
                selectedPlayer?.id === player.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
              } ${hasVoted || isEliminated ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:shadow-lg'}`}
              onClick={() => !hasVoted && !isEliminated && setSelectedPlayer(player)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-lg">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {player.isHost ? 'Host' : 'Player'}
                    </p>
                  </div>
                </div>
                
                {selectedPlayer?.id === player.id && !hasVoted && (
                  <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    Selected
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Words submitted:</p>
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
                    <div className="text-gray-400 text-sm italic">No words submitted</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting Tips */}
      <div className="card mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Voting Tips</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">•</span>
            <span>Look for <strong>vague or generic</strong> words that could apply to many themes</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">•</span>
            <span>Watch for words that seem <strong>disconnected</strong> from the theme</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">•</span>
            <span>Consider if someone's words are <strong>too similar</strong> to another player's</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">•</span>
            <span>The mindless player might try to <strong>copy others</strong> or play it safe</span>
          </li>
        </ul>
      </div>

      {/* Vote Button */}
      {!hasVoted && !isEliminated && (
        <div className="card">
          <div className="text-center">
            <button
              onClick={handleVote}
              disabled={!selectedPlayer || isVoting}
              className="btn btn-primary btn-lg"
            >
              {isVoting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Vote...
                </span>
              ) : selectedPlayer ? (
                `Vote for ${selectedPlayer.name}`
              ) : (
                'Select a player to vote'
              )}
            </button>
            
            {selectedPlayer && !isVoting && (
              <p className="text-sm text-gray-500 mt-2">
                Click to confirm your vote for {selectedPlayer.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onGoHome}
          className="btn btn-outline"
        >
          Leave Game
        </button>
        
        <div className="text-sm text-gray-500">
          {allVotesIn ? 
            'All votes submitted! Calculating results...' : 
            `Waiting for ${votingProgress.totalPlayers - votingProgress.votedCount} more votes`
          }
        </div>
      </div>
    </div>
  );
}

export default VotingScreen; 