import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Update this with your backend URL

export const createGame = async (playerName, playerColor) => {
  const response = await axios.post(`${API_URL}/games`, { playerName, playerColor });
  return response.data;
};

export const joinGame = async (gameId, playerName, playerColor) => {
  const response = await axios.post(`${API_URL}/games/${gameId}/join`, { playerName, playerColor });
  return response.data;
};

export const startGame = async (gameId, playerId) => {
  const response = await axios.put(`${API_URL}/games/${gameId}/start`, { playerId });
  return response.data;
};

export const getGameState = async (gameId) => {
  const response = await axios.get(`${API_URL}/games/${gameId}`);
  return response.data;
};