import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Lobby from './pages/Lobby';
import GameArena from './pages/GameArena';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white selection:bg-primary-500 selection:text-white">
        <Routes>
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game/:roomId" element={<GameArena />} />
          <Route path="/" element={<Navigate to="/lobby" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
