
import React from 'react';
import { PIECE_IMAGES } from '../constants.tsx';
import { Color, PieceSymbol } from 'chess.js';

interface CapturedPiecesProps {
  captured: { type: PieceSymbol; color: Color }[];
  color: Color;
  advantage: number;
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ captured, color, advantage }) => {
  const pieces = captured.filter(p => p.color !== color);
  
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const sortedPieces = [...pieces].sort((a, b) => values[a.type] - values[b.type]);

  return (
    <div className="flex items-center gap-1 h-8">
      <div className="flex -space-x-2 overflow-hidden">
        {sortedPieces.map((p, i) => (
          <img 
            key={i} 
            src={PIECE_IMAGES[`${p.color}${p.type.toUpperCase()}`]} 
            alt={p.type} 
            className="w-6 h-6 object-contain drop-shadow-sm"
          />
        ))}
      </div>
      {advantage > 0 && (
        <span className="text-[10px] font-bold text-[#bababa] ml-1">+{advantage}</span>
      )}
    </div>
  );
};

export default CapturedPieces;
