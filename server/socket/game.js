const rooms = new Map(); // Store room state

const initGameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', ({ roomId, username }) => {
      console.log(`User ${username} (${socket.id}) attempting to join room: ${roomId}`);
      let room = rooms.get(roomId);

      if (!room) {
        room = {
          id: roomId,
          players: [],
          gameState: 'waiting',
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
          room.cards = generateCards();
          console.log(`Game starting in room ${roomId}`);
          io.to(roomId).emit('game_start', room);
        } else {
          console.log(`Waiting for opponent in room ${roomId}`);
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

          // Check if game complete
          if (room.cards.every(c => c.matched)) {
              const winner = room.players.reduce((prev, curr) => 
                room.scores[curr.id] > room.scores[prev.id] ? curr : prev
              );
              io.to(roomId).emit('game_over', { winner, scores: room.scores });
              rooms.delete(roomId);
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

const generateCards = () => {
  const emojis = ['🔥', '💎', '🚀', '⭐', '🍀', '🍎', '🍕', '⚽', '🎸', '🎮'];
  const values = [...emojis, ...emojis];
  return values
    .sort(() => Math.random() - 0.5)
    .map((val, index) => ({ id: index, value: val, matched: false }));
};

module.exports = initGameSocket;
