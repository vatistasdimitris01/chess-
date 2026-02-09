
import React from 'react';
import { Color } from 'chess.js';
import { BoardOrientation } from '../types';

interface GameStatusProps {
  turn: Color;
  isCheck: boolean;
  result: string | null;
  isGameOver: boolean;
  orientation: BoardOrientation;
}

const GameStatus: React.FC<GameStatusProps> = ({ turn, isCheck, result, isGameOver }) => {
  if (isGameOver) return null;

  return (
    <div className="w-full mb-4">
      {isCheck && (
        <div className="bg-red-900/40 text-red-400 text-center py-2 rounded border border-red-900/60 font-black tracking-widest animate-pulse mb-3">
          CHECK
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-[#5c5b58] font-bold uppercase">
        <span>Current Phase</span>
        <span className="text-[#81b64c]">Active Play</span>
      </div>
    </div>
  );
};

export default GameStatus;
