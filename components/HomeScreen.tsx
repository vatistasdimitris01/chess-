
import React, { useState, useEffect } from 'react';
import { GameMode } from '../types';
// Added Link as LinkIcon to imports from lucide-react
import { User, Cpu, Users, Globe, Trophy, Link as LinkIcon } from 'lucide-react';

interface HomeScreenProps {
  onStart: (mode: GameMode, name: string, roomId?: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState(localStorage.getItem('chess_username') || '');
  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId] = useState('');

  // Detection logic for Join ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setJoinId(room.toUpperCase());
      setShowJoin(true);
    }
  }, []);

  const handleStart = (mode: GameMode, roomId?: string) => {
    let finalName = name.trim();
    if (!finalName) {
      finalName = `Player_${Math.floor(Math.random() * 1000)}`;
      setName(finalName);
    }
    localStorage.setItem('chess_username', finalName);
    onStart(mode, finalName, roomId);
  };

  return (
    <div className="min-h-screen bg-[#302e2b] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        <div className="grid grid-cols-8 h-full w-full">
           {Array.from({length: 64}).map((_, i) => (
             <div key={i} className={(Math.floor(i/8) + i) % 2 === 0 ? 'bg-white' : 'bg-transparent'} />
           ))}
        </div>
      </div>

      <div className="max-w-md w-full bg-[#262421] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 border border-[#3c3a37] z-10 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#81b64c] rounded-2xl flex items-center justify-center shadow-[0_10px_20px_#81b64c33] mb-4 transform -rotate-6">
             <Trophy size={48} className="text-[#262421]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Grandmaster Chess</h1>
          <p className="text-[#bababa] text-sm font-medium mt-1">Professional Chess Web Engine</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-[#bababa] uppercase mb-2 ml-1 tracking-widest">Player Profile</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5b58] group-focus-within:text-[#81b64c] transition-colors" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter display name..."
                className="w-full bg-[#1a1917] border border-[#3c3a37] rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:border-[#81b64c] focus:ring-1 focus:ring-[#81b64c] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleStart('bot')}
              className="group flex items-center gap-4 bg-[#81b64c] hover:bg-[#a3d160] text-[#262421] p-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg shadow-[#81b64c15]"
            >
              <div className="bg-[#262421]/10 p-2 rounded-lg group-hover:bg-[#262421]/20 transition-colors">
                <Cpu size={24} />
              </div>
              <div className="text-left">
                <div className="leading-none text-base">vs. Computer</div>
                <div className="text-[10px] opacity-70 font-black mt-1 uppercase tracking-tighter">Minimax AI (Casual/Master)</div>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleStart('online')}
                className="flex flex-col items-center justify-center gap-2 bg-[#3c3a37] hover:bg-[#4d4b48] text-white p-4 rounded-xl font-bold transition-all transform hover:-translate-y-1"
              >
                <Globe size={22} className="text-[#81b64c]" />
                <span className="text-sm">Host Game</span>
              </button>

              <button 
                onClick={() => handleStart('local')}
                className="flex flex-col items-center justify-center gap-2 bg-[#3c3a37] hover:bg-[#4d4b48] text-white p-4 rounded-xl font-bold transition-all transform hover:-translate-y-1"
              >
                <Users size={22} className="text-[#bababa]" />
                <span className="text-sm">Local Duel</span>
              </button>
            </div>

            {!showJoin ? (
              <button 
                onClick={() => setShowJoin(true)}
                className="w-full py-4 text-[#bababa] text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <LinkIcon size={14} /> Join via Code
              </button>
            ) : (
              <div className="bg-[#1a1917] p-3 rounded-xl border border-[#3c3a37] animate-in slide-in-from-top-2 duration-300 mt-2">
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     autoFocus
                     value={joinId}
                     onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                     placeholder="ROOM CODE"
                     className="flex-1 bg-[#262421] border border-[#3c3a37] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#81b64c]"
                   />
                   <button 
                     onClick={() => handleStart('online', joinId)}
                     disabled={!joinId}
                     className="bg-[#81b64c] disabled:opacity-50 text-black px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-transform"
                   >Join</button>
                   <button 
                     onClick={() => setShowJoin(false)}
                     className="text-[10px] text-[#5c5b58] px-2 font-bold uppercase tracking-widest hover:text-white"
                   >Close</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#3c3a37] text-center">
           <p className="text-[10px] text-[#5c5b58] uppercase font-black tracking-widest">Multiplayer Ready • Open Source</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
