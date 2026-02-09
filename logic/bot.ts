
import { Chess, Move } from 'chess.js';

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 32,
  b: 33,
  r: 50,
  q: 90,
  k: 20000,
};

// Simplified Piece-Square Tables (PST) to encourage good positioning
const PST: Record<string, number[][]> = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      totalEvaluation += getPieceValue(board[i][j], i, j);
    }
  }
  return totalEvaluation;
};

const getPieceValue = (piece: any, x: number, y: number): number => {
  if (piece === null) return 0;

  const absoluteValue = PIECE_VALUES[piece.type] + PST[piece.type][piece.color === 'w' ? 7 - x : x][y];
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

export const getBestMove = (game: Chess, depth: number = 3): Move | null => {
  const possibleMoves = game.moves({ verbose: true });
  if (possibleMoves.length === 0) return null;

  let bestMove = null;
  let bestValue = -Infinity;
  const isMaximizingPlayer = game.turn() === 'w';

  // Sort moves slightly to improve alpha-beta pruning (captures first)
  const sortedMoves = possibleMoves.sort((a, b) => {
    if (a.captured && !b.captured) return -1;
    if (!a.captured && b.captured) return 1;
    return 0;
  });

  for (const move of sortedMoves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);
    game.undo();

    const actualValue = isMaximizingPlayer ? boardValue : -boardValue;

    if (actualValue > bestValue) {
      bestValue = actualValue;
      bestMove = move;
    }
  }

  return bestMove;
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const possibleMoves = game.moves({ verbose: true });

  if (isMaximizingPlayer) {
    let bestValue = -Infinity;
    for (const move of possibleMoves) {
      game.move(move);
      bestValue = Math.max(bestValue, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      alpha = Math.max(alpha, bestValue);
      if (beta <= alpha) break;
    }
    return bestValue;
  } else {
    let bestValue = Infinity;
    for (const move of possibleMoves) {
      game.move(move);
      bestValue = Math.min(bestValue, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      beta = Math.min(beta, bestValue);
      if (beta <= alpha) break;
    }
    return bestValue;
  }
};
