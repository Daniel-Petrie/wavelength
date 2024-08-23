// src/components/Game.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameState, startGame } from '../api';
import CircleScale from './CircleScale';
import '../styles.css';

const socket = io('http://localhost:5000'); // Update with your backend URL

const Game = () => {
    const { gameId } = useParams();
    const location = useLocation();
    const { isHost, playerId, playerName, playerColor } = location.state;
  
    const [gameState, setGameState] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [localGuess, setLocalGuess] = useState(null);

  useEffect(() => {
    const fetchGameState = async () => {
      const state = await getGameState(gameId);
      setGameState(state);
    };

    fetchGameState();

    socket.emit('joinGame', { gameId, playerId });

    socket.on('gameUpdate', (updatedGameState) => {
      setGameState(updatedGameState);
    });

    return () => {
      socket.off('gameUpdate');
    };
  }, [gameId, playerId]);

  const handleStartGame = async () => {
    if (isHost) {
      try {
        const response = await startGame(gameId, playerId);
        console.log('Start game response:', response);
      } catch (error) {
        console.error('Error starting game:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          alert(`Error starting game: ${error.response.data.message}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          alert("No response received from server. Please check your connection.");
        } else {
          console.error('Error setting up request:', error.message);
          alert(`An error occurred: ${error.message}`);
        }
      }
    }
  };
   const handleSubmitKeyword = () => {
    socket.emit('submitKeyword', { gameId, keyword });
    setKeyword('');
  };

  const handleGuess = (position) => {
    setLocalGuess(position);
  };

  const handleLockIn = () => {
    if (localGuess !== null) {
      socket.emit('submitGuess', { gameId, playerId, position: localGuess });
      setLocalGuess(null);
    }
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const isActivePlayer = gameState.players[gameState.activePlayerIndex].id === playerId;

  return (
    <div className="container">
      <h1>Game Room: {gameId}</h1>
      <div className="game-info">
        <h2>Players:</h2>
        <ul className="player-list">
          {gameState.players.map((player) => (
            <li key={player.id} style={{ color: player.color }}>
              {player.name} - Score: {player.score}
            </li>
          ))}
        </ul>
      </div>
      {gameState.phase === 'waiting' && isHost && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {gameState.phase === 'input' && (
        <div className="game-info">
          <h3>Category: {gameState.category}</h3>
          <h4>Question: {gameState.question}</h4>
          {isActivePlayer ? (
            <>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword"
              />
              <button onClick={handleSubmitKeyword}>Submit Keyword</button>
            </>
          ) : (
            <p>Waiting for {gameState.players[gameState.activePlayerIndex].name} to enter a keyword...</p>
          )}
          <div className="circle-scale-container">
            <CircleScale
              markerPosition={gameState.markerPosition}
              guesses={[]}
              phase={gameState.phase}
              isActivePlayer={isActivePlayer}
              playerColors={{}}
            />
          </div>
        </div>
      )}
      {gameState.phase === 'guessing' && (
        <div className="game-info">
          <h3>Category: {gameState.category}</h3>
          <h4>Question: {gameState.question}</h4>
          <p>Keyword: {gameState.keyword}</p>
          {!isActivePlayer && (
            <>
              <div className="circle-scale-container">
                <CircleScale
                  markerPosition={gameState.markerPosition}
                  guesses={localGuess ? [{ playerId, position: localGuess }] : []}
                  phase={gameState.phase}
                  isActivePlayer={false}
                  playerColors={{ [playerId]: playerColor }}
                  onGuess={handleGuess}
                />
              </div>
              <button onClick={handleLockIn} disabled={localGuess === null}>
                Lock In Guess
              </button>
            </>
          )}
        </div>
      )}
      {gameState.phase === 'reveal' && (
        <div className="game-info">
          <h3>Category: {gameState.category}</h3>
          <h4>Question: {gameState.question}</h4>
          <p>Keyword: {gameState.keyword}</p>
          <p>Round Results:</p>
          <div className="circle-scale-container">
            <CircleScale
              markerPosition={gameState.markerPosition}
              guesses={gameState.guesses}
              phase={gameState.phase}
              isActivePlayer={true}
              playerColors={gameState.players.reduce((acc, player) => {
                acc[player.id] = player.color;
                return acc;
              }, {})}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;