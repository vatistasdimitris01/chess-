
import React from 'react';
import { Color } from 'chess.js';
import { PIECE_IMAGES } from '../constants';

interface PromotionModalProps {
  color: Color;
  onSelect: (piece: string) => void;
  onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onClose }) => {
  const pieces = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#262421] p-6 rounded-xl shadow-2xl border-2 border-[#3c3a37] animate-in fade-in zoom-in duration-200">
        <h3 className="text-white font-bold mb-4 text-center text-lg">Promote to</h3>
        <div className="flex gap-4">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="w-20 h-20 bg-[#3c3a37] hover:bg-[#4d4b48] rounded-lg transition-all flex items-center justify-center group"
            >
              <img 
                src={PIECE_IMAGES[`${color}${p.type.toUpperCase()}`]} 
                alt={p.label}
                className="w-16 h-16 group-hover:scale-110 transition-transform"
              />
            </button>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="w-full mt-4 text-[#bababa] text-sm hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PromotionModal;
