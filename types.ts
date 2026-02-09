
import { Color, PieceSymbol, Square } from 'chess.js';

export type BoardOrientation = 'white' | 'black';
export type GameMode = 'bot' | 'local' | 'online';

export interface Move {
  from: Square;
  to: Square;
  promotion?: string;
  san?: string;
}

export interface Player {
  name: string;
  id: string;
  color?: Color;
}

export interface GameState {
  fen: string;
  history: string[];
  currentMoveIndex: number;
  lastMove: { from: string; to: string } | null;
  turn: Color;
  isCheck: boolean;
  isGameOver: boolean;
  gameResult: string | null;
}
