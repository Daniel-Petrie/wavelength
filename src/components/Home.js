import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../api';
import '../styles.css';

const Home = () => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#000000');
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    try {
      const { gameId, playerId } = await createGame(playerName, playerColor);
      navigate(`/game/${gameId}`, { state: { isHost: true, playerId, playerName, playerColor } });
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    }
  };

  const handleJoinGame = async () => {
    try {
      const { playerId } = await joinGame(gameId, playerName, playerColor);
      navigate(`/game/${gameId}`, { state: { isHost: false, playerId, playerName, playerColor } });
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please check the game ID and try again.');
    }
  };
  return (
    <div className="container">
      <h1>Wavelength Game</h1>
      <div className="game-info">
        <h2>Create a New Game</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="color"
          value={playerColor}
          onChange={(e) => setPlayerColor(e.target.value)}
        />
        <button onClick={handleCreateGame}>Create Game</button>
      </div>
      <div className="game-info">
        <h2>Join a Game</h2>
        <input
          type="text"
          placeholder="Game ID"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="color"
          value={playerColor}
          onChange={(e) => setPlayerColor(e.target.value)}
        />
        <button onClick={handleJoinGame}>Join Game</button>
      </div>
    </div>
  );
};

export default Home;