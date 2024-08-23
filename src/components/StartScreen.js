import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StartScreen() {
  const [playerCount, setPlayerCount] = useState(3);
  const [roundCount, setRoundCount] = useState(10);
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Navigate to the game route with state
    navigate('/game', { state: { playerCount, roundCount } });
  };

  return (
    <div className="start-screen">
      <h1>Wavelength Game</h1>
      <div>
        <label>
          Number of Players:
          <input
            type="number"
            min="2"
            max="8"
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Number of Rounds:
          <input
            type="number"
            min="1"
            max="20"
            value={roundCount}
            onChange={(e) => setRoundCount(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={handleStartGame}>Start Game</button>
    </div>
  );
}

export default StartScreen;
