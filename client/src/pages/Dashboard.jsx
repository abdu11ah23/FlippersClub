import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { Play, Users, LogOut, Settings, Trophy } from 'lucide-react';

const Dashboard = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const joinGame = () => {
    if (roomId.trim()) {
      navigate(`/game/${roomId}`);
    } else {
      // Generate random ID if empty
      const randomId = Math.random().toString(36).substring(7);
      navigate(`/game/${randomId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <nav className="border-b bg-slate-900/50 border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-600">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FlippersClub</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {user?.username}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 mx-auto w-full max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Join Panel */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="p-8 glass shadow-xl shadow-primary-500/5 animate-fade-in">
              <h2 className="mb-2 text-2xl font-bold">Start a Battle</h2>
              <p className="mb-8 text-slate-400">Join a room or create a new one to challenge a friend.</p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. #772)"
                  className="flex-1 py-4 px-6 transition-all border outline-none bg-slate-950/50 border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-lg font-mono"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <button
                  onClick={joinGame}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary-600 hover:bg-primary-500 rounded-2xl shadow-xl shadow-primary-500/30 text-lg"
                >
                  <Play fill="currentColor" size={20} />
                  Play Now
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="p-6 text-center border bg-slate-900/30 border-slate-800 rounded-2xl">
                <p className="mb-1 text-slate-400">Wins</p>
                <p className="text-3xl font-bold text-emerald-400">12</p>
              </div>
              <div className="p-6 text-center border bg-slate-900/30 border-slate-800 rounded-2xl">
                <p className="mb-1 text-slate-400">Loses</p>
                <p className="text-3xl font-bold text-rose-400">4</p>
              </div>
              <div className="p-6 text-center border bg-slate-900/30 border-slate-800 rounded-2xl">
                <p className="mb-1 text-slate-400">Total</p>
                <p className="text-3xl font-bold text-primary-400">16</p>
              </div>
            </div>
          </div>

          {/* Friends Sidebar */}
          <div className="flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex-1 p-6 border bg-slate-900/50 border-slate-800 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-200">
                  <Users size={18} />
                  Online Friends
                </h3>
                <button className="text-sm font-semibold text-primary-400 hover:text-primary-300">Invite</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-slate-400">P2</div>
                    <div>
                      <p className="text-sm font-semibold">PlayerTwo</p>
                      <p className="text-xs text-slate-500">In Dashboard</p>
                    </div>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-all rounded-lg bg-primary-600/10 text-primary-400 hover:bg-primary-600 hover:text-white">
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
