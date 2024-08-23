// src/components/CircleScale.js
import React from 'react';

function CircleScale({ markerPosition, guesses, phase, onGuess, isActivePlayer, playerColors }) {
  const svgSize = 400;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = 180;

  const markerWidth = 0.15;
  const markerStart = markerPosition - markerWidth / 2;
  const markerEnd = markerPosition + markerWidth / 2;

  const handleClick = (event) => {
    if (phase === 'guessing' && !isActivePlayer) {
      const svgRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - svgRect.left - centerX;
      const y = centerY - (event.clientY - svgRect.top);
      let angle = Math.atan2(y, x);
      if (angle < 0) angle += 2 * Math.PI;
      const normalizedPosition = angle / Math.PI;
      onGuess(normalizedPosition);
    }
  };

  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY - (radius * Math.sin(angleInRadians)),
    };
  };

  const createMarkerSegment = (start, end, color) => {
    const startPoint = polarToCartesian(centerX, centerY, radius, start * Math.PI);
    const endPoint = polarToCartesian(centerX, centerY, radius, end * Math.PI);
    const largeArcFlag = end - start > 0.5 ? 1 : 0;

    return (
      <path
        d={`M ${centerX} ${centerY} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} Z`}
        fill={color}
      />
    );
  };

  return (
    <svg 
      width={svgSize} 
      height={centerY + 10} 
      viewBox={`0 0 ${svgSize} ${centerY + 10}`} 
      onClick={handleClick}
    >
      {/* Main dark half-circle */}
      <path d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0 1 ${centerX + radius},${centerY}`} fill="#1e1e2e" />

      {/* Marker segments */}
      {(phase === 'reveal' || (phase === 'input' && isActivePlayer) || (phase === 'guessing' && isActivePlayer)) && (
        <>
          {createMarkerSegment(markerStart, markerStart + 0.03, "#ff9999")} {/* 2 points */}
          {createMarkerSegment(markerStart + 0.03, markerStart + 0.06, "#ff6666")} {/* 3 points */}
          {createMarkerSegment(markerStart + 0.06, markerEnd - 0.06, "#ff3333")} {/* 4 points */}
          {createMarkerSegment(markerEnd - 0.06, markerEnd - 0.03, "#ff6666")} {/* 3 points */}
          {createMarkerSegment(markerEnd - 0.03, markerEnd, "#ff9999")} {/* 2 points */}
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