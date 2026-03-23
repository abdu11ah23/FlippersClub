import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService';
import { UserPlus, User, Lock } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 glass animate-fade-in shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 mb-4 rounded-full bg-primary-500/20 text-primary-400">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-slate-400">Join the Memory Master community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pick a username"
              className="w-full py-3 pl-10 pr-4 transition-all border outline-none bg-slate-900/50 border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Create a password"
              className="w-full py-3 pl-10 pr-4 transition-all border outline-none bg-slate-900/50 border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-center text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary-600 hover:bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20"
          >
            Get Started
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
