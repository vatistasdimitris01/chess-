
import React, { useState, useEffect } from 'react';
import { GameMode } from '../types';
import { User, Cpu, Users, Globe, Trophy } from 'lucide-react';

interface HomeScreenProps {
  onStart: (mode: GameMode, name: string, roomId?: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState(localStorage.getItem('chess_username') || '');
  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId] = useState('');

  // Auto-fill join ID from URL if present (useful for sharing Vercel links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setJoinId(room.toUpperCase());
      setShowJoin(true);
    }
  }, []);

  const handleStart = (mode: GameMode, roomId?: string) => {
    if (!name.trim()) {
      const generatedName = `Player_${Math.floor(Math.random() * 1000)}`;
      setName(generatedName);
      localStorage.setItem('chess_username', generatedName);
      onStart(mode, generatedName, roomId);
      return;
    }
    localStorage.setItem('chess_username', name);
    onStart(mode, name, roomId);
  };

  return (
    <div className="min-h-screen bg-[#302e2b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="grid grid-cols-8 h-full w-full">
           {Array.from({length: 64}).map((_, i) => (
             <div key={i} className={(Math.floor(i/8) + i) % 2 === 0 ? 'bg-white' : 'bg-transparent'} />
           ))}
        </div>
      </div>

      <div className="max-w-md w-full bg-[#262421] rounded-2xl shadow-2xl p-8 border border-[#3c3a37] z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#81b64c] rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-6">
             <Trophy size={48} className="text-[#262421]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Grandmaster Pro</h1>
          <p className="text-[#bababa] text-sm">Vercel-ready Chess Platform</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#bababa] uppercase mb-2 ml-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5b58]" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name..."
                className="w-full bg-[#1a1917] border border-[#3c3a37] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#81b64c] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleStart('bot')}
              className="flex items-center gap-4 bg-[#81b64c] hover:bg-[#a3d160] text-[#262421] p-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Cpu size={24} />
              <div className="text-left">
                <div className="leading-none">Vs Computer</div>
                <div className="text-[10px] opacity-70 font-normal">Minimax Engine Level 3/4</div>
              </div>
            </button>

            <button 
              onClick={() => handleStart('online')}
              className="flex items-center gap-4 bg-[#3c3a37] hover:bg-[#4d4b48] text-white p-4 rounded-xl font-bold transition-all transform hover:-translate-y-1"
            >
              <Globe size={24} />
              <div className="text-left">
                <div className="leading-none">Create Room</div>
                <div className="text-[10px] text-[#bababa] font-normal">Real-time Online (BroadcastSync)</div>
              </div>
            </button>

            {!showJoin ? (
              <button 
                onClick={() => setShowJoin(true)}
                className="flex items-center gap-4 bg-[#3c3a37] hover:bg-[#4d4b48] text-white p-4 rounded-xl font-bold transition-all"
              >
                <Users size={24} />
                <div className="text-left">
                  <div className="leading-none">Join Room</div>
                  <div className="text-[10px] text-[#bababa] font-normal">Enter room code or link</div>
                </div>
              </button>
            ) : (
              <div className="bg-[#1a1917] p-3 rounded-xl border border-[#3c3a37] animate-in slide-in-from-top-2">
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={joinId}
                     onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                     placeholder="ROOM CODE..."
                     className="flex-1 bg-[#262421] border border-[#3c3a37] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#81b64c]"
                   />
                   <button 
                     onClick={() => handleStart('online', joinId)}
                     className="bg-[#81b64c] text-black px-4 py-2 rounded-lg font-bold"
                   >Join</button>
                   <button 
                     onClick={() => setShowJoin(false)}
                     className="text-xs text-[#5c5b58] px-2"
                   >Cancel</button>
                </div>
              </div>
            )}

            <button 
              onClick={() => handleStart('local')}
              className="text-[#bababa] text-sm hover:text-white transition-colors py-2"
            >
              Play Local 2-Player
            </button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#3c3a37] text-center">
           <p className="text-[10px] text-[#5c5b58] uppercase font-bold tracking-widest">Multi-Device Compatible</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
