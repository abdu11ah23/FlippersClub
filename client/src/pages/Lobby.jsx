import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Users } from 'lucide-react';

const Lobby = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const joinGame = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Save username locally (no DB)
    localStorage.setItem('user', JSON.stringify({ username }));
    
    const finalRoomId = roomId.trim() || Math.random().toString(36).substring(7);
    navigate(`/game/${finalRoomId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b bg-slate-900/50 border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-600">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FlippersClub</span>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">Real-time Arena</p>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 glass animate-fade-in shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
             <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center mb-4 text-primary-400">
                <Users size={32} />
             </div>
             <h1 className="text-3xl font-bold">Welcome</h1>
             <p className="text-slate-400">Enter your name and join a room</p>
          </div>

          <form onSubmit={joinGame} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Nickname"
                className="w-full py-4 px-6 border outline-none bg-slate-900/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Room Code (optional)"
                className="w-full py-4 px-6 border outline-none bg-slate-900/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 font-mono"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary-600 hover:bg-primary-500 rounded-2xl shadow-xl shadow-primary-500/30 text-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <Play fill="currentColor" size={20} />
                Jump in & Play
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-6 grayscale opacity-40">
             <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Instant
             </div>
             <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                Free
             </div>
             <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                5 Levels
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
