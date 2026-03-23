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
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const serverUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
    console.log('Connecting to server:', serverUrl);
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server!');
      newSocket.emit('join_game', { roomId, username: user.username });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    newSocket.on('game_start', (data) => {
      console.log('Game started!', data);
      setRoomData(data);
      setCards(data.cards);
      setScores(data.scores);
      setTurn(data.turn);
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

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('game_over', ({ winner, scores }) => {
      setWinner(winner);
      setScores(scores);
      setGameState('over');
    });

    newSocket.on('opponent_left', () => {
      setGameState('waiting');
      setCards([]);
      setRoomData(null);
    });

    return () => newSocket.close();
  }, [roomId, user.username]);

  const handleCardClick = (index) => {
    if (gameState !== 'playing' || turn !== socket.id || flippedIndices.length >= 2) return;
    const isMatched = cards[index]?.matched;
    const isAlreadyFlipped = flippedIndices.includes(index);
    if (isMatched || isAlreadyFlipped) return;

    socket.emit('flip_card', { roomId, cardIndex: index });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit('send_message', { roomId, message, username: user.username });
    setMessage('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const rival = roomData?.players.find(p => p.id !== socket?.id);

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full glass p-10 flex flex-col items-center text-center animate-fade-in shadow-2xl">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-primary-500 animate-spin mb-8"></div>
          <h2 className="text-3xl font-bold mb-2">Joining Arena...</h2>
          <p className="text-slate-400 mb-8 font-medium">Waiting for opponent to join room <code className="bg-slate-900 px-2 py-0.5 rounded text-primary-400 font-mono">#{roomId}</code></p>
          <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/5 z-20">
        <button onClick={() => navigate('/lobby')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-4">
          {/* My Stats */}
          <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border transition-all ${turn === socket?.id ? 'bg-primary-500/10 border-primary-500/50 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-800/50 border-white/5'}`}>
            <span className="text-[10px] font-black text-slate-500 uppercase">YOU</span>
            <span className="font-mono text-xl font-black">{scores[socket?.id] || 0}</span>
          </div>

          <div className="text-slate-700 font-black italic scale-75">VS</div>

          {/* Opponent Stats */}
          <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border transition-all ${turn !== socket?.id ? 'bg-amber-500/10 border-amber-500/50 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-800/50 border-white/5'}`}>
            <span className="font-mono text-xl font-black">{scores[rival?.id] || 0}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[60px]">{rival?.username || 'Rival'}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-2 rounded-xl transition-all relative ${isChatOpen ? 'bg-primary-500 text-white' : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400'}`}
        >
          <MessageSquare size={20} />
          {!isChatOpen && messages.length > 0 && (
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950"></span>
          )}
        </button>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
           <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
              {cards.map((card, index) => (
                <MemoryCard
                  key={card.id}
                  card={card}
                  isFlipped={flippedIndices.includes(index) || card.matched}
                  onClick={() => handleCardClick(index)}
                />
              ))}
           </div>
           
           <div className="flex flex-col items-center text-center">
              {turn === socket?.id ? (
                <div className="flex items-center gap-2 text-primary-400 font-black bg-primary-500/10 px-8 py-3 rounded-2xl border border-primary-500/30 animate-pulse uppercase tracking-wider text-sm shadow-lg shadow-primary-500/10">
                  <Sparkles size={18} />
                  <span>Your Turn</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-900/50 px-8 py-3 rounded-2xl border border-white/5 uppercase tracking-wider text-sm">
                  <Timer size={18} className="animate-pulse" />
                  <span>{rival?.username}'s Turn</span>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Chat Sidebar/Overlay */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-slate-950/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl transition-transform duration-300 ease-in-out z-30 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2 font-black text-xs tracking-[0.2em] text-slate-400">
               <MessageSquare size={16} className="text-primary-500" />
               BATTLE LOG
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500">
               <ArrowLeft size={20} className="rotate-180" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-tighter">{msg.username}</span>
                <div className={`px-4 py-2 rounded-2xl max-w-[90%] break-words text-sm font-medium ${msg.username === user.username ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
         </div>

         <form onSubmit={sendMessage} className="p-4 border-t border-white/5 bg-slate-900/50 flex gap-2">
            <input
              type="text"
              placeholder="Talk trash..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary-500/50 transition-colors"
            />
            <button type="submit" className="p-3 bg-primary-600 rounded-xl hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20">
              <Send size={18} />
            </button>
         </form>
      </div>

      {/* WIN SCREEN MODAL */}
      {gameState === 'over' && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
           <div className="max-w-md w-full glass p-12 flex flex-col items-center text-center animate-scale-in border-2 border-primary-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center mb-8 text-primary-400 border-2 border-primary-500/30">
                 <Trophy size={48} />
              </div>
              
              <h2 className="text-5xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 italic">
                {winner.id === socket?.id ? 'VICTORY' : 'DEFEAT'}
              </h2>
              
              <p className="text-slate-400 mb-10 font-bold uppercase tracking-[0.2em] text-xs">
                {winner.id === socket?.id ? 'Unmatched Master' : `Fallen Warrior`}
              </p>
              
              <div className="flex gap-4 w-full">
                 <button onClick={() => navigate('/lobby')} className="flex-1 py-4 font-black bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-xs tracking-widest">
                   LOBBY
                 </button>
                 <button onClick={() => window.location.reload()} className="flex-1 py-4 font-black bg-primary-600 hover:bg-primary-500 rounded-2xl transition-all text-xs tracking-widest shadow-xl shadow-primary-600/30 active:scale-95">
                   REMATCH
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameArena;
