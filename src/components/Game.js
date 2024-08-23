// src/components/Game.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { getGameState, startGame } from '../api';
import CircleScale from './CircleScale';
import Leaderboard from './Leaderboard';
import '../styles.css';

const socket = io('http://localhost:5000');

const Game = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const { isHost, playerId, playerName, playerColor } = location.state;

  const [gameState, setGameState] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [localGuess, setLocalGuess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsEarned, setPointsEarned] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const state = await getGameState(gameId);
        setGameState(state);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game state:', error);
        setLoading(false);
      }
    };

    fetchGameState();

    socket.emit('joinGame', { gameId, playerId });

    socket.on('gameUpdate', (updatedGameState) => {
      setGameState(updatedGameState);
    });

    socket.on('roundResults', (results) => {
      setPointsEarned(results);
      setTimeout(() => setPointsEarned(null), 5000); // Hide after 5 seconds
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('roundResults');
    };
  }, [gameId, playerId]);

  const handleStartGame = async () => {
    if (isHost) {
      try {
        await startGame(gameId, playerId);
      } catch (error) {
        console.error('Error starting game:', error);
        alert("An error occurred while starting the game. Please try again.");
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
      setLocalGuess(null); // Reset local guess after locking in
    }
  };

  if (loading) {
    return <div>Loading game...</div>;
  }

  if (!gameState) {
    return <div>Error loading game. Please try again.</div>;
  }

  const isActivePlayer = gameState.players[gameState.activePlayerIndex].id === playerId;

  if (showLeaderboard) {
    return <Leaderboard players={gameState.players} onClose={() => setShowLeaderboard(false)} />;
  }

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
        <p>Round: {gameState.currentRound} / {gameState.totalRounds}</p>
      </div>
      {gameState.phase === 'waiting' && isHost && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {(gameState.phase === 'input' || gameState.phase === 'guessing') && (
        <div className="timer">
          Time remaining: {gameState.phase === 'input' ? gameState.inputTimer : gameState.guessingTimer} seconds
        </div>
      )}
         {gameState.isGameOver && (
        <button onClick={() => setShowLeaderboard(true)}>Show Leaderboard</button>
      )}
      {(gameState.phase === 'input' || gameState.phase === 'guessing') && (
        <div className="game-info">
          <h3>Category: {gameState.category}</h3>
          <h4>Question: {gameState.question}</h4>
          {gameState.phase === 'input' && isActivePlayer && (
            <>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword"
              />
              <button onClick={handleSubmitKeyword}>Submit Keyword</button>
            </>
          )}
          {gameState.phase === 'guessing' && (
            <p>Keyword: {gameState.keyword}</p>
          )}
             <div className="circle-scale-container">
        <CircleScale
          markerPosition={gameState.markerPosition}
          guesses={[...gameState.guesses, ...(localGuess && !isActivePlayer ? [{ playerId, position: localGuess }] : [])]}
          phase={gameState.phase}
          isActivePlayer={isActivePlayer}
          playerColors={gameState.players.reduce((acc, player) => {
            acc[player.id] = player.color;
            return acc;
          }, {})}
          onGuess={handleGuess}
        />
      </div>
      {gameState.phase === 'guessing' && !isActivePlayer && (
        <button onClick={handleLockIn} disabled={localGuess === null}>
          Lock In Guess
        </button>
      )}
        </div>
      )}
      {gameState.phase === 'gameOver' && (
        <button onClick={() => setShowLeaderboard(true)}>Show Leaderboard</button>
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
      {pointsEarned && (
        <div className="points-popup">
          <h3>Points Earned:</h3>
          <ul>
            {Object.entries(pointsEarned).map(([playerId, points]) => (
              <li key={playerId}>
                {gameState.players.find(p => p.id === playerId).name}: {points} points
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Game;