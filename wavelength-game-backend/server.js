// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Game = require('./gameLogic');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const games = new Map();

// Create a new game room
app.post('/games', (req, res) => {
    const { playerName, playerColor } = req.body;
    const gameId = uuidv4();
    const newGame = new Game(gameId);
    const hostPlayer = newGame.addPlayer(playerName, playerColor);
    if (hostPlayer) {
      games.set(gameId, newGame);
      res.status(201).json({ gameId, playerId: hostPlayer.id });
    } else {
      res.status(400).json({ message: 'Failed to create game' });
    }
  });
  

// Join a game room
app.post('/games/:id/join', (req, res) => {
  const game = games.get(req.params.id);
  if (game) {
    const { playerName, playerColor } = req.body;
    const player = game.addPlayer(playerName, playerColor);
    if (player) {
      res.status(200).json({ playerId: player.id });
    } else {
      res.status(400).json({ message: 'Game is full or has already started' });
    }
  } else {
    res.status(404).json({ message: 'Game not found' });
  }
});

// Get game state
app.get('/games/:id', (req, res) => {
  const game = games.get(req.params.id);
  if (game) {
    res.json(game);
  } else {
    res.status(404).json({ message: 'Game not found' });
  }
});

// Start the game
app.put('/games/:id/start', (req, res) => {
    console.log('Received start game request for game:', req.params.id);
    console.log('Request body:', req.body);
    
    const game = games.get(req.params.id);
    if (game) {
      console.log('Game found. Current state:', game);
      const { playerId } = req.body;
      const hostPlayer = game.players.find(p => p.isHost);
      
      if (hostPlayer && hostPlayer.id === playerId) {
        const success = game.startGame();
        if (success) {
          console.log('Game started successfully');
          io.to(req.params.id).emit('gameUpdate', game);
          res.status(200).json({ message: 'Game started' });
        } else {
          console.log('Failed to start game. Not enough players.');
          res.status(400).json({ message: 'Not enough players to start the game' });
        }
      } else {
        console.log('Unauthorized start attempt. Host:', hostPlayer, 'Request player:', playerId);
        res.status(403).json({ message: 'Only the host can start the game' });
      }
    } else {
      console.log('Game not found:', req.params.id);
      res.status(404).json({ message: 'Game not found' });
    }
  });

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinGame', ({ gameId, playerId }) => {
    socket.join(gameId);
    console.log(`Player ${playerId} joined game ${gameId}`);
    
    const game = games.get(gameId);
    if (game) {
      io.to(gameId).emit('gameUpdate', game);
    }
  });

  socket.on('submitKeyword', ({ gameId, keyword }) => {
    const game = games.get(gameId);
    if (game) {
      game.submitKeyword(keyword);
      io.to(gameId).emit('gameUpdate', game);
    }
  });

  socket.on('submitGuess', ({ gameId, playerId, position }) => {
    const game = games.get(gameId);
    if (game) {
      game.submitGuess(playerId, position);
      io.to(gameId).emit('gameUpdate', game);
      
      if (game.phase === 'reveal') {
        setTimeout(() => {
          game.calculateScores();
          io.to(gameId).emit('gameUpdate', game);
          
          setTimeout(() => {
            game.nextRound();
            io.to(gameId).emit('gameUpdate', game);
          }, 10000); // Wait 10 seconds before starting next round
        }, 3000); // Wait 3 seconds before calculating scores
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});