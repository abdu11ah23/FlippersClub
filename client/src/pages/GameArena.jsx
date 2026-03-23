import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import MemoryCard from '../components/MemoryCard';
import { Send, ArrowLeft, Trophy, MessageSquare, Timer, Sparkles } from 'lucide-react';

const GameArena = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [socket, setSocket] = useState(null);
  
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, over
  const [roomData, setRoomData] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [scores, setScores] = useState({});
  const [turn, setTurn] = useState(null);
  const [level, setLevel] = useState(1);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.emit('join_game', { roomId, username: user.username });

    newSocket.on('game_start', (data) => {
      setRoomData(data);
      setCards(data.cards);
      setScores(data.scores);
      setTurn(data.turn);
      setLevel(data.level);
      setGameState('playing');
    });

    newSocket.on('card_flipped', ({ socketId, cardIndex }) => {
      setFlippedIndices(prev => [...prev, cardIndex]);
    });

    newSocket.on('match_found', ({ socketId, score, matchedIndices }) => {
      setScores(prev => ({ ...prev, [socketId]: score }));
      setCards(prev => {
        const newCards = [...prev];
        matchedIndices.forEach(idx => newCards[idx].matched = true);
        return newCards;
      });
      setFlippedIndices([]);
    });

    newSocket.on('turn_switched', ({ nextTurn, resetIndices }) => {
      setTimeout(() => {
        setTurn(nextTurn);
        setFlippedIndices([]);
      }, 1000);
    });

    newSocket.on('level_up', ({ level, cards }) => {
      setLevel(level);
      setCards(cards);
      setFlippedIndices([]);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('game_over', ({ winner, scores }) => {
      setWinner(winner);
      setGameState('over');
    });

    return () => newSocket.close();
  }, [roomId, user.username]);

  const handleFlip = (cardIndex) => {
    if (gameState !== 'playing' || turn !== socket.id || flippedIndices.length >= 2) return;
    socket.emit('flip_card', { roomId, cardIndex });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { roomId, message, username: user.username });
      setMessage('');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (gameState === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="p-12 glass animate-pulse flex flex-col items-center max-w-lg w-full">
          <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mb-6">
            <Timer size={40} className="text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Joining Arena...</h2>
          <p className="text-slate-400 mb-8">Waiting for a worthy opponent to join room <span className="font-mono text-primary-400">#{roomId}</span></p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'over') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">
        <div className="relative p-12 glass shadow-2xl shadow-primary-500/20 max-w-lg w-full z-10 animate-fade-in">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center border-8 border-slate-950 shadow-xl">
            <Trophy size={48} className="text-slate-900" />
          </div>
          <h2 className="text-4xl font-bold mt-8 mb-2">Battle Result</h2>
          <p className="text-slate-400 mb-8">Level {level} reached</p>
          
          <div className="text-5xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
            {winner.username === user.username ? 'VICTORY' : 'DEFEAT'}
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 text-lg font-bold bg-primary-600 hover:bg-primary-500 rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Return to Lobby
          </button>
        </div>
        {/* Background Sparkles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute animate-bounce" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                    <Sparkles size={24} className="text-primary-400" />
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden lg:flex-row">
      
      {/* Game Content */}
      <div className="flex flex-col flex-1 p-4 lg:p-8">
        {/* Header Information */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
             <div className="p-3 border border-slate-800 bg-slate-900/50 rounded-2xl shadow-xl">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Level</p>
                <p className="text-2xl font-black text-primary-400">{level}</p>
             </div>
             <div className="hidden sm:block">
                <p className="text-xl font-bold text-slate-400">#{roomId}</p>
             </div>
          </div>

          <div className="flex gap-4">
            {roomData.players.map(p => (
              <div key={p.id} className={`p-1 pl-4 pr-3 border rounded-full transition-all flex items-center gap-4 ${turn === p.id ? 'border-primary-500 bg-primary-500/10 scale-110 shadow-lg' : 'border-slate-800 opacity-60'}`}>
                <div className="flex flex-col items-end">
                   <p className="text-xs font-bold uppercase opacity-50">{p.id === socket.id ? 'YOU' : 'RIVAL'}</p>
                   <p className="text-sm font-bold truncate w-20 sm:w-auto">{p.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-lg border-2 border-slate-700">
                  {scores[p.id] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Grid */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center min-h-0">
          <div 
             className="grid justify-center gap-3 sm:gap-4 p-4"
             style={{ 
               gridTemplateColumns: `repeat(${level <= 2 ? 3 : 4}, minmax(0, 1fr))`,
               maxWidth: '800px'
             }}
          >
            {cards.map((card, idx) => (
              <MemoryCard
                key={card.id}
                card={card}
                index={idx}
                isFlipped={flippedIndices.includes(idx)}
                isMatched={card.matched}
                onFlip={handleFlip}
                disabled={turn !== socket.id || flippedIndices.length >= 2}
              />
            ))}
          </div>
        </div>

        {/* Turn Status Toast */}
        <div className="flex justify-center mt-6">
            <div className={`px-8 py-3 rounded-2xl font-bold transition-all ${turn === socket.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {turn === socket.id ? "It's your turn! Match some cards." : "Rival's turn. Watch carefully..."}
            </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-96 border-t border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col lg:border-t-0 lg:border-l">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
           <MessageSquare size={20} className="text-primary-400" />
           <h3 className="font-bold text-slate-300 uppercase tracking-widest text-sm">Battle Log</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-500 font-bold mb-1">{msg.username}</span>
              <div 
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  msg.username === user.username 
                    ? 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-900/20' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-6 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Send message..."
            className="flex-1 py-3 px-4 border border-slate-700 rounded-xl bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm transition-all"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 bg-primary-600 hover:bg-primary-500 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-600/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default GameArena;
