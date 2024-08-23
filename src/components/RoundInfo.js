// src/components/RoundInfo.js
import React from 'react';

function RoundInfo({ round, totalRounds, activePlayer }) {
  return (
    <div className="round-info">
      <h2>Round {round} of {totalRounds}</h2>
      <p>Active Player: {activePlayer}</p>
    </div>
  );
}

export default RoundInfo;