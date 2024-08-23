// src/components/PlayerList.js
import React from 'react';

function PlayerList({ players, activePlayer }) {
  return (
    <div className="player-list">
      <h2>Players</h2>
      <ul>
        {players.map((player, index) => (
          <li key={player.id} className={index === activePlayer ? 'active' : ''}>
            {player.name}: {player.score} points
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;