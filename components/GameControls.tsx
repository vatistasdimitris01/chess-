
import React from 'react';
import { RotateCcw, Undo2, ArrowLeftRight, Settings } from 'lucide-react';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onFlip: () => void;
  canUndo: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onUndo, onReset, onFlip, canUndo }) => {
  return (
    <div className="flex justify-between w-full mt-6 gap-3">
      <button 
        onClick={onFlip}
        title="Flip Board"
        className="flex-1 bg-[#3c3a37] hover:bg-[#4d4b48] text-white py-3 px-4 rounded-md font-bold transition-all flex items-center justify-center gap-2 border-b-4 border-[#262421] active:translate-y-0.5 active:border-b-0"
      >
        <ArrowLeftRight size={20} />
        <span className="hidden sm:inline">Flip</span>
      </button>

      <button 
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo Move"
        className={`flex-1 ${canUndo ? 'bg-[#3c3a37] hover:bg-[#4d4b48]' : 'bg-[#211f1c] opacity-50 cursor-not-allowed'} text-white py-3 px-4 rounded-md font-bold transition-all flex items-center justify-center gap-2 border-b-4 border-[#262421] active:translate-y-0.5 active:border-b-0`}
      >
        <Undo2 size={20} />
        <span className="hidden sm:inline">Undo</span>
      </button>

      <button 
        onClick={() => {
            if(window.confirm('Are you sure you want to reset the game?')) {
                onReset();
            }
        }}
        title="Reset Game"
        className="flex-1 bg-[#81b64c] hover:bg-[#a3d160] text-[#262421] py-3 px-4 rounded-md font-bold transition-all flex items-center justify-center gap-2 border-b-4 border-[#5f8c38] active:translate-y-0.5 active:border-b-0"
      >
        <RotateCcw size={20} />
        <span className="hidden sm:inline">New Game</span>
      </button>
    </div>
  );
};

export default GameControls;
