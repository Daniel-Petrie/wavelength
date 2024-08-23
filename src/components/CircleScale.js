// src/components/CircleScale.js
import React from 'react';

function CircleScale({ markerPosition, guesses, phase, onGuess, isActivePlayer, playerColors }) {
  const svgSize = 800;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = 390;

  const handleClick = (event) => {
    if (phase === 'guessing' && !isActivePlayer) {
      const svgRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - svgRect.left - centerX;
      const y = centerY - (event.clientY - svgRect.top);
      const angle = Math.atan2(y, x);
      const normalizedPosition = (angle + Math.PI) / Math.PI;
      onGuess(normalizedPosition);
    }
  };

  const createSlice = (startAngle, endAngle, color) => {
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    
    return (
      <path
        d={`M ${centerX},${centerY} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag} 0 ${end.x},${end.y} Z`}
        fill={color}
      />
    );
  };

  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY - (radius * Math.sin(angleInRadians)),
    };
  };

  const markerWidth = 0.25;
  const markerStart = (markerPosition - markerWidth / 2 + 1) % 1;
  const markerEnd = (markerPosition + markerWidth / 2 + 1) % 1;

  const createMarkerSegment = (start, end, color) => {
    if (start < end) {
      return createSlice(start * Math.PI, end * Math.PI, color);
    } else {
      return (
        <>
          {createSlice(start * Math.PI, Math.PI, color)}
          {createSlice(0, end * Math.PI, color)}
        </>
      );
    }
  };

  return (
    <svg width={svgSize} height={centerY + 10} viewBox={`0 0 ${svgSize} ${centerY + 10}`} onClick={handleClick}>
      {/* Main dark half-circle */}
      <path d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0 1 ${centerX + radius},${centerY}`} fill="#1e1e2e" />

      {/* Marker segments (only visible for active player during input phase or everyone during reveal phase) */}
      {(phase === 'reveal' || (phase === 'input' && isActivePlayer)) && (
        <>
          {createMarkerSegment(markerStart, (markerStart + 0.05) % 1, "#ff9999")} {/* 2 points */}
          {createMarkerSegment((markerStart + 0.05) % 1, (markerStart + 0.1) % 1, "#ff6666")} {/* 3 points */}
          {createMarkerSegment((markerStart + 0.1) % 1, (markerEnd - 0.1 + 1) % 1, "#ff3333")} {/* 4 points */}
          {createMarkerSegment((markerEnd - 0.1 + 1) % 1, (markerEnd - 0.05 + 1) % 1, "#ff6666")} {/* 3 points */}
          {createMarkerSegment((markerEnd - 0.05 + 1) % 1, markerEnd, "#ff9999")} {/* 2 points */}
        </>
      )}

      {/* Guesses */}
      {guesses.map((guess, index) => (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={polarToCartesian(centerX, centerY, radius, guess.position * Math.PI).x}
          y2={polarToCartesian(centerX, centerY, radius, guess.position * Math.PI).y}
          stroke={playerColors[guess.playerId]}
          strokeWidth="4"
        />
      ))}

      {/* Outer arc */}
      <path d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0 1 ${centerX + radius},${centerY}`} fill="none" stroke="#ffffff" strokeWidth="2" />
    </svg>
  );
}

export default CircleScale;