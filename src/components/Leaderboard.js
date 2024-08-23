// src/components/Leaderboard.js
import React from 'react';

const Leaderboard = ({ players, onClose }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="leaderboard">
      <h2>Final Leaderboard</h2>
      <ol>
        {sortedPlayers.map((player) => (
          <li key={player.id} style={{ color: player.color }}>
            {player.name} - {player.score} points
          </li>
        ))}
      </ol>
      <button onClick={onClose}>Close Leaderboard</button>
    </div>
  );
};

export default Leaderboard;