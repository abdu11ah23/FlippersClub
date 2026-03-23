const rooms = new Map(); // Store room state

const initGameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', ({ roomId, username }) => {
      let room = rooms.get(roomId);

      if (!room) {
        room = {
          id: roomId,
          players: [],
          gameState: 'waiting',
          level: 1,
          cards: [],
          scores: {},
          turn: null,
          flippedCards: [],
        };
        rooms.set(roomId, room);
      }

      if (room.players.length < 2) {
        room.players.push({ id: socket.id, username, score: 0 });
        socket.join(roomId);
        room.scores[socket.id] = 0;

        if (room.players.length === 2) {
          room.gameState = 'playing';
          room.turn = room.players[0].id;
          room.cards = generateCards(room.level);
          io.to(roomId).emit('game_start', room);
        } else {
          socket.emit('waiting_for_opponent');
        }
      } else {
        socket.emit('error', { message: 'Room is full' });
      }
    });

    socket.on('flip_card', ({ roomId, cardIndex }) => {
      const room = rooms.get(roomId);
      if (!room || room.turn !== socket.id || room.flippedCards.length >= 2) return;

      if (room.flippedCards.some(c => c.index === cardIndex)) return;

      const card = room.cards[cardIndex];
      room.flippedCards.push({ index: cardIndex, value: card.value });
      
      io.to(roomId).emit('card_flipped', { socketId: socket.id, cardIndex });

      if (room.flippedCards.length === 2) {
        const [first, second] = room.flippedCards;
        if (first.value === second.value) {
          // Match
          room.scores[socket.id] += 1;
          room.cards[first.index].matched = true;
          room.cards[second.index].matched = true;
          room.flippedCards = [];
          
          io.to(roomId).emit('match_found', { 
            socketId: socket.id, 
            score: room.scores[socket.id],
            matchedIndices: [first.index, second.index]
          });

          // Check if level complete
          if (room.cards.every(c => c.matched)) {
            if (room.level < 5) {
              room.level += 1;
              room.cards = generateCards(room.level);
              room.flippedCards = [];
              io.to(roomId).emit('level_up', { level: room.level, cards: room.cards });
            } else {
              const winner = room.players.reduce((prev, curr) => 
                room.scores[curr.id] > room.scores[prev.id] ? curr : prev
              );
              io.to(roomId).emit('game_over', { winner, scores: room.scores });
              rooms.delete(roomId);
            }
          }
        } else {
          // No match
          setTimeout(() => {
            const nextTurn = room.players.find(p => p.id !== socket.id).id;
            room.turn = nextTurn;
            room.flippedCards = [];
            io.to(roomId).emit('turn_switched', { nextTurn, resetIndices: [first.index, second.index] });
          }, 1500);
        }
      }
    });

    socket.on('send_message', ({ roomId, message, username }) => {
      io.to(roomId).emit('receive_message', { username, message, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle player leaving room
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit('opponent_left');
            room.gameState = 'waiting';
          }
        }
      });
    });
  });
};

const generateCards = (level) => {
  const pairs = (level + 1) * 2; // Level 1: 4 cards, Level 2: 6 cards, etc.
  // Wait, prompt said 5 progressive levels. Let's make it more challenging.
  // Level 1: 2x2 (2 pairs)
  // Level 2: 2x3 (3 pairs) -> maybe 4x3?
  // Let's go with: 2x2, 2x4, 4x4, 4x5, 6x6 pairs.
  const levels = [2, 4, 8, 12, 18]; // Number of pairs
  const numPairs = levels[level - 1];
  const values = [];
  for (let i = 1; i <= numPairs; i++) {
    values.push(i, i);
  }
  return values
    .sort(() => Math.random() - 0.5)
    .map((val, index) => ({ id: index, value: val, matched: false }));
};

module.exports = initGameSocket;
