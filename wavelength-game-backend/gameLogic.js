// gameLogic.js
class Game {
    constructor(id) {
      this.id = id;
      this.players = [];
      this.currentRound = 1;
      this.totalRounds = 10;
      this.activePlayerIndex = 0;
      this.markerPosition = Math.random();
      this.keyword = '';
      this.guesses = [];
      this.phase = 'waiting'; // waiting, input, guessing, reveal, gameOver
      this.inputTimer = 20;
      this.guessingTimer = 40;
      this.category = '';
    this.question = '';
    }
  
    addPlayer(name, color) {
      if (this.players.length < 8 && this.phase === 'waiting') {
        const player = {
          id: this.players.length.toString(), // Use index as ID for simplicity
          name,
          color,
          score: 0,
          isHost: this.players.length === 0 // First player is the host
        };
        this.players.push(player);
        return player;
      }
      return null;
    }
  
    
  startGame() {
    if (this.players.length >= 2) {
      this.phase = 'input';
      this.setNewQuestion();
      return true;
    }
    return false;
  }

  setNewQuestion() {
    const categories = [
      { category: 'Pot Luck',
        questions: [        
          'Unknown Person or Famous Person',    // Popularity
            'Gourmet Food or Fast Food',
            'Good Actor or Bad Actor',
            'Limited or Unlimited',
            'Useful Invention or Useless Invention',
            'Bad Candy or Good Candy',
            'Bad Movie or Good Movie',
            'Bad Song or Good Song',
            'Underrated Athlete or Overrated Athlete',
            'Underrated Actor or Overrated Actor',
            'Reliable or Unreliable',
            'Expensive or Cheap',
            "Risky or Sage",
            'Easy Job or Hard Job',
            'Red Flag or Green Flag',
            'Annoying Sound or Pleasing Sound',
            'Scary Movie or Funny Movie',
            'Hero or Villian',
            'Popular Opinion or Unpopular Opinion',
            'Good Present or Bad Present',
            'Easy Sport or Hard Sport',
            'Good Place for a Date or Bad Place for a Date',
            'Good Animal to be Attacked by or Bad Animal to be Attacked by',
            'Good Way to be Woken up or Bad Way to be Woken up',
            'Useless Super Power or Useful Super Power',
            'Bad Nickname or Good Nickname',
            'Human Name or Dog Name',
            'Fun Olympic Sport to Watch, or Boring Olympic Sport to Watch',
            'Good Rapper Name or Bad Rapper Name',
            'Slow Car Brand or Fast Car Brand',
        
    ]}
      // Add more categories and questions as needed
    ];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    this.category = randomCategory.category;
    this.question = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  }

  
    submitKeyword(keyword) {
      if (this.phase === 'input') {
        this.keyword = keyword;
        this.phase = 'guessing';
        this.guessingTimer = 40;
        return true;
      }
      return false;
    }
  
    submitGuess(playerId, position) {
      if (this.phase === 'guessing' && !this.guesses.some(g => g.playerId === playerId)) {
        this.guesses.push({ playerId, position });
        if (this.guesses.length === this.players.length - 1) {
          this.phase = 'reveal';
        }
        return true;
      }
      return false;
    }
  
    calculateScores() {
      const markerWidth = 0.25; // 25% of the scale
      const markerStart = this.markerPosition - markerWidth / 2;
      const markerEnd = this.markerPosition + markerWidth / 2;
  
      this.players.forEach(player => {
        if (player.id !== this.players[this.activePlayerIndex].id) {
          const guess = this.guesses.find(g => g.playerId === player.id);
          if (guess) {
            const distance = Math.abs(guess.position - this.markerPosition);
            if (distance <= markerWidth / 2) {
              player.score += 4;
            } else if (distance <= markerWidth) {
              player.score += 3;
            } else if (distance <= markerWidth * 1.5) {
              player.score += 2;
            }
          }
        }
      });
    }
  
    nextRound() {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
        this.markerPosition = Math.random();
        this.keyword = '';
        this.guesses = [];
        this.phase = 'input';
        this.inputTimer = 20;
      } else {
        this.phase = 'gameOver';
      }
    }
  
    decrementTimer() {
      if (this.phase === 'input' && this.inputTimer > 0) {
        this.inputTimer--;
        if (this.inputTimer === 0) {
          this.submitKeyword("Time's up!");
        }
      } else if (this.phase === 'guessing' && this.guessingTimer > 0) {
        this.guessingTimer--;
        if (this.guessingTimer === 0) {
          this.phase = 'reveal';
        }
      }
    }
  }
  
  module.exports = Game;