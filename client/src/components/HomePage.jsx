import { useState } from 'react';

function HomePage({ onCreateRoom, onJoinRoom, isConnecting }) {
  const [activeTab, setActiveTab] = useState('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setIsLoading(true);
    try {
      await onCreateRoom(playerName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    
    setIsLoading(true);
    try {
      await onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setRoomCode(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 rounded-full flex items-center justify-center mb-6 shadow-2xl hover-lift animate-pulse-slow">
            <svg className="h-10 w-10 text-white animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="relative mb-4">
            <h1 className="text-5xl font-bold text-gradient-rainbow hover:animate-wiggle transition-all duration-300 relative z-10">Mind Map</h1>
          </div>
          <p className="text-white text-lg font-medium mb-2">
            A multiplayer word association game with hidden roles
          </p>
          <div className="flex justify-center space-x-1 text-white/80">
            <span className="inline-block w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>

        {/* Game Rules */}
        <div className="card hover-glow">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            How to Play
          </h3>
          <ul className="text-sm text-gray-800 space-y-3">
            <li className="flex items-start hover:bg-purple-50 p-2 rounded-lg transition-colors">
              <span className="text-purple-500 mr-3 mt-1">🎯</span>
              <span>Everyone gets a <strong className="text-purple-700">theme</strong> and a secret <strong className="text-purple-700">concept</strong></span>
            </li>
            <li className="flex items-start hover:bg-purple-50 p-2 rounded-lg transition-colors">
              <span className="text-red-500 mr-3 mt-1">🤔</span>
              <span>One player is <strong className="text-red-700">mindless</strong> and doesn't know the concept</span>
            </li>
            <li className="flex items-start hover:bg-purple-50 p-2 rounded-lg transition-colors">
              <span className="text-blue-500 mr-3 mt-1">💭</span>
              <span>Take turns giving <strong className="text-blue-700">one word</strong> that connects to your concept</span>
            </li>
            <li className="flex items-start hover:bg-purple-50 p-2 rounded-lg transition-colors">
              <span className="text-green-500 mr-3 mt-1">🗳️</span>
              <span>After 2 rounds, <strong className="text-green-700">vote</strong> for who you think is mindless</span>
            </li>
          </ul>
        </div>

        {/* Main Form */}
        <div className="card">
          {/* Tab Navigation */}
          <div className="flex mb-6 glass rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-white text-primary-600 shadow-lg transform scale-105'
                  : 'text-gray-800 hover:text-primary-200 hover:bg-white/10'
              }`}
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === 'join'
                  ? 'bg-white text-primary-600 shadow-lg transform scale-105'
                  : 'text-gray-800 hover:text-primary-200 hover:bg-white/10'
              }`}
            >
              Join Room
            </button>
          </div>

          {/* Player Name Input */}
          <div className="mb-4">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-800 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
              placeholder="Enter your name"
              maxLength={20}
              required
            />
          </div>

          {/* Create Room Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-green-800">
                    You'll be the host and can start the game when ready
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!playerName.trim() || isLoading || isConnecting}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Room...
                  </span>
                ) : (
                  'Create Room'
                )}
              </button>
            </form>
          )}

          {/* Join Room Form */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={handleRoomCodeChange}
                  className="input text-center text-lg font-mono tracking-wider"
                  placeholder="ABC123"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-character room code
                </p>
              </div>
              
              <button
                type="submit"
                disabled={!playerName.trim() || !roomCode.trim() || roomCode.length !== 6 || isLoading || isConnecting}
                className="btn btn-secondary w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Joining Room...
                  </span>
                ) : (
                  'Join Room'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need 4-10 players to start the game</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 