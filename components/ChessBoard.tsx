
import React from 'react';
import { Chess, Square, Move } from 'chess.js';
import { BoardOrientation } from '../types.ts';
import { RANKS, FILES, PIECE_IMAGES } from '../constants.tsx';

interface ChessBoardProps {
  game: Chess;
  orientation: BoardOrientation;
  selectedSquare: Square | null;
  lastMove: Move | null;
  preMove: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  game, 
  orientation, 
  selectedSquare, 
  lastMove,
  preMove,
  onSquareClick 
}) => {
  const isWhite = orientation === 'white';
  const displayedRanks = isWhite ? RANKS : [...RANKS].reverse();
  const displayedFiles = isWhite ? FILES : [...FILES].reverse();

  const legalMoves = selectedSquare 
    ? game.moves({ square: selectedSquare, verbose: true }).map(m => m.to)
    : [];

  const getSquareClass = (sq: Square, isLight: boolean) => {
    let classes = isLight ? 'square-light' : 'square-dark';
    
    if (selectedSquare === sq) classes += ' ring-4 ring-inset ring-[#f6f669] opacity-90';
    if (lastMove && (lastMove.from === sq || lastMove.to === sq)) classes += ' square-last-move';
    if (preMove && (preMove.from === sq || preMove.to === sq)) classes += ' square-premove';
    
    const piece = game.get(sq);
    if (game.inCheck() && piece?.type === 'k' && piece.color === game.turn()) {
        classes += ' square-check';
    }

    return classes;
  };

  return (
    <div className="chess-board-grid select-none relative">
      {displayedRanks.map((rank, rIdx) => (
        displayedFiles.map((file, fIdx) => {
          const square = `${file}${rank}` as Square;
          const isLight = (rIdx + fIdx) % 2 === 0;
          const piece = game.get(square);
          const isLegalMove = legalMoves.includes(square);
          const isCapture = isLegalMove && piece !== null;

          return (
            <div 
              key={square}
              className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${getSquareClass(square, isLight)}`}
              onClick={() => onSquareClick(square)}
            >
              {piece && (
                <img 
                  src={PIECE_IMAGES[`${piece.color}${piece.type.toUpperCase()}`]} 
                  alt={`${piece.color} ${piece.type}`}
                  className="w-[90%] h-[90%] z-10 transition-transform hover:scale-105 active:scale-95"
                />
              )}

              {isLegalMove && (
                <div className={`absolute z-20 pointer-events-none ${isCapture ? 'square-highlight-capture' : 'square-highlight-move'}`} />
              )}

              {fIdx === 0 && (
                <span className={`absolute top-0.5 left-0.5 text-[10px] md:text-xs font-bold ${isLight ? 'text-[#779556]' : 'text-[#ebecd0]'}`}>
                  {rank}
                </span>
              )}
              {rIdx === 7 && (
                <span className={`absolute bottom-0.5 right-0.5 text-[10px] md:text-xs font-bold ${isLight ? 'text-[#779556]' : 'text-[#ebecd0]'}`}>
                  {file}
                </span>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default ChessBoard;
