
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chess, Square, Move, Color, PieceSymbol } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import MoveHistory from './components/MoveHistory';
import GameControls from './components/GameControls';
import PromotionModal from './components/PromotionModal';
import GameStatus from './components/GameStatus';
import CapturedPieces from './components/CapturedPieces';
import HomeScreen from './components/HomeScreen';
import { BoardOrientation, GameMode } from './types';
import { getBestMove } from './logic/bot';
import { ChessSync } from './logic/multiplayer';
import { User, Cpu, Bot, Link as LinkIcon, ArrowLeft, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState<GameMode>('bot');
  const [userName, setUserName] = useState(localStorage.getItem('chess_username') || '');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const [orientation, setOrientation] = useState<BoardOrientation>('white');
  const [promotionSquare, setPromotionSquare] = useState<{ from: Square; to: Square } | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [botLevel, setBotLevel] = useState(3);
  const [isBotThinking, setIsBotThinking] = useState(false);
  
  const syncRef = useRef<ChessSync>(new ChessSync());

  // Deep Link & History Initialization
  useEffect(() => {
    // 1. Set initial history state for Home
    if (!window.history.state) {
      window.history.replaceState({ screen: 'home' }, '');
    }

    // 2. Check for Room ID in URL on initial load
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    
    if (roomFromUrl) {
      // If we have a room in the URL, we can attempt to auto-join
      // We'll let HomeScreen handle the name first, but App tracks the room
      setRoomId(roomFromUrl.toUpperCase());
    }

    // 3. PopState listener for back button
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (!state || state.screen === 'home') {
        setCurrentScreen('home');
        syncRef.current.disconnect();
      } else if (state.screen === 'game') {
        // If we go forward/back to a game state, we need to handle session reconnection
        // For simplicity in this demo, we mainly focus on "Back to Home"
        setCurrentScreen('game');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const history = game.history({ verbose: true });
  const isGameOver = game.isGameOver();
  
  const gameResult = isGameOver 
    ? game.isCheckmate() ? `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`
    : game.isDraw() ? 'Draw!' : 'Game Over'
    : null;

  const handleStartGame = useCallback((selectedMode: GameMode, name: string, rId?: string) => {
    setUserName(name);
    setMode(selectedMode);
    const newGame = new Chess();
    setGame(newGame);
    
    // Update URL and Browser History
    const roomParam = rId ? `?room=${rId}` : '';
    const newUrl = window.location.pathname + roomParam;
    
    window.history.pushState(
      { screen: 'game', mode: selectedMode, roomId: rId }, 
      '', 
      newUrl
    );

    if (selectedMode === 'online') {
      const actualRoomId = rId || ChessSync.generateRoomId();
      setRoomId(actualRoomId);
      // Room creator (no rId passed to handleStart) is White, Joiner (rId passed) is Black
      const assignedColor = rId ? 'b' : 'w';
      setPlayerColor(assignedColor);
      setOrientation(assignedColor === 'w' ? 'white' : 'black');
      
      syncRef.current.connect(actualRoomId, (data) => {
        if (data.type === 'MOVE') {
          setGame((prevGame) => {
            const nextGame = new Chess(prevGame.fen());
            try {
              nextGame.move({ from: data.from, to: data.to, promotion: data.promotion || 'q' });
              return nextGame;
            } catch (e) {
              return prevGame;
            }
          });
        } else if (data.type === 'RESET') {
          setGame(new Chess(data.fen));
        }
      });
    } else {
      setPlayerColor(null);
      setOrientation('white');
      setRoomId(null);
    }
    
    setCurrentScreen('game');
  }, []);

  const copyInviteLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleMove = useCallback((from: Square, to: Square, promotion: string = 'q') => {
    if (mode === 'online' && game.turn() !== playerColor) return false;

    try {
      const move = game.move({ from, to, promotion });
      if (move) {
        const nextFen = game.fen();
        setGame(new Chess(nextFen));
        setSelectedSquare(null);
        if (mode === 'online') {
          syncRef.current.sendMove(from, to, nextFen, promotion);
        }
        return true;
      }
    } catch (e) {}
    return false;
  }, [game, mode, playerColor]);

  useEffect(() => {
    if (mode === 'bot' && game.turn() === 'b' && !isGameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const move = getBestMove(game, botLevel);
        if (move) {
          handleMove(move.from, move.to, move.promotion);
        }
        setIsBotThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game, mode, isGameOver, botLevel, handleMove]);

  const onSquareClick = (square: Square) => {
    if (isGameOver || isBotThinking) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }
      const piece = game.get(selectedSquare);
      const isPromotion = piece?.type === 'p' && ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));
      
      if (isPromotion) {
        const moves = game.moves({ square: selectedSquare, verbose: true });
        if (moves.some(m => m.to === square)) {
          setPromotionSquare({ from: selectedSquare, to: square });
          return;
        }
      }
      handleMove(selectedSquare, square);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    if (mode === 'online') {
      syncRef.current.sendReset(newGame.fen());
    }
  };

  const getMaterial = (color: Color) => {
    let score = 0;
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    game.board().flat().forEach(sq => {
      if (sq && sq.color === color) score += values[sq.type];
    });
    return score;
  };

  const whiteMaterial = getMaterial('w');
  const blackMaterial = getMaterial('b');
  const capturedPieces = history.filter(m => m.captured).map(m => ({
    type: m.captured as PieceSymbol,
    color: m.color === 'w' ? 'b' as Color : 'w' as Color
  }));

  if (currentScreen === 'home') {
    return <HomeScreen onStart={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-[#302e2b] text-white flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-10 overflow-x-hidden">
      
      <div className="w-full max-w-[640px] flex flex-col gap-4 animate-in fade-in duration-500">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-2">
           <button 
             onClick={() => { window.history.back(); }}
             className="flex items-center gap-2 text-[#bababa] hover:text-white transition-colors font-bold text-sm bg-[#3c3a37]/30 px-3 py-1.5 rounded-lg border border-[#3c3a37] active:scale-95"
           >
             <ArrowLeft size={18} /> Exit Game
           </button>
           
           {roomId && (
             <div className="flex items-center gap-2">
               <div className="bg-[#1a1917] px-3 py-1.5 rounded-lg border border-[#3c3a37] flex items-center gap-2 text-[10px] font-black tracking-widest text-[#bababa]">
                  <LinkIcon size={12} className="text-[#81b64c]" />
                  ROOM: {roomId}
               </div>
               <button 
                 onClick={copyInviteLink}
                 className="p-1.5 bg-[#81b64c] hover:bg-[#a3d160] text-black rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold active:scale-95"
                 title="Copy Invite Link"
               >
                 {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                 {copyFeedback ? 'COPIED!' : 'SHARE'}
               </button>
             </div>
           )}
        </div>

        {/* Top Player Info (Opponent) */}
        <div className="flex items-center justify-between bg-[#262421] p-3 rounded-t-lg border-x border-t border-[#3c3a37]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3c3a37] rounded-md">
              {mode === 'bot' ? <Cpu size={24} className="text-[#81b64c]" /> : <User size={24} />}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                {mode === 'bot' ? 'Stockfish Lite' : (mode === 'online' ? (playerColor === 'w' ? 'Opponent' : userName) : 'Player 2')}
                {isBotThinking && <span className="text-[10px] bg-[#81b64c] text-black px-1.5 rounded animate-pulse">THINKING</span>}
              </div>
              <CapturedPieces captured={capturedPieces} color="b" advantage={Math.max(0, blackMaterial - whiteMaterial)} />
            </div>
          </div>
          {game.turn() === 'b' && !isGameOver && <div className="w-2.5 h-2.5 rounded-full bg-[#81b64c] shadow-[0_0_10px_#81b64c]" />}
        </div>

        {/* Chess Board */}
        <div className="relative shadow-2xl overflow-hidden border-4 border-[#262421] rounded shadow-black/50">
          <ChessBoard 
            game={game}
            orientation={orientation}
            selectedSquare={selectedSquare}
            lastMove={history[history.length - 1] || null}
            preMove={null}
            onSquareClick={onSquareClick}
          />
          {promotionSquare && (
            <PromotionModal 
              color={game.turn()} 
              onSelect={(p) => { handleMove(promotionSquare.from, promotionSquare.to, p); setPromotionSquare(null); }} 
              onClose={() => setPromotionSquare(null)}
            />
          )}
        </div>

        {/* Bottom Player Info (User) */}
        <div className="flex items-center justify-between bg-[#262421] p-3 rounded-b-lg border-x border-b border-[#3c3a37]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3c3a37] rounded-md">
              <User size={24} className="text-[#bababa]" />
            </div>
            <div>
              <div className="font-bold">{mode === 'online' ? (playerColor === 'w' ? userName : 'Opponent') : (userName || 'You')}</div>
              <CapturedPieces captured={capturedPieces} color="w" advantage={Math.max(0, whiteMaterial - blackMaterial)} />
            </div>
          </div>
          {game.turn() === 'w' && !isGameOver && <div className="w-2.5 h-2.5 rounded-full bg-[#81b64c] shadow-[0_0_10px_#81b64c]" />}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-[380px] h-full flex flex-col gap-6 self-stretch animate-in slide-in-from-right-10 duration-500">
        <div className="bg-[#262421] rounded-xl flex flex-col flex-1 shadow-xl border border-[#3c3a37] overflow-hidden">
          <div className="p-5 border-b border-[#3c3a37] flex items-center justify-between bg-[#211f1c]">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bot size={20} className="text-[#81b64c]" /> 
              Move Log
            </h2>
            <div className="text-[10px] bg-[#3c3a37] px-2 py-1 rounded uppercase font-black text-[#bababa]">
               {mode} MODE
            </div>
          </div>
          <MoveHistory history={history} />
          <div className="p-5 bg-[#211f1c] border-t border-[#3c3a37]">
             <GameStatus turn={game.turn()} isCheck={game.inCheck()} result={gameResult} isGameOver={isGameOver} orientation={orientation} />
            <GameControls 
              onUndo={() => { game.undo(); if(mode === 'bot') game.undo(); setGame(new Chess(game.fen())); }} 
              onReset={resetGame} 
              onFlip={() => setOrientation(prev => prev === 'white' ? 'black' : 'white')}
              canUndo={history.length > 0 && mode !== 'online'}
            />
          </div>
        </div>

        {mode === 'bot' && (
          <div className="bg-[#262421] p-4 rounded-xl border border-[#3c3a37] shadow-lg">
             <label className="text-xs font-bold text-[#bababa] uppercase mb-2 block tracking-wider">Engine Depth</label>
             <div className="flex gap-2">
                {[3, 4].map(level => (
                   <button 
                     key={level}
                     onClick={() => setBotLevel(level)}
                     className={`flex-1 py-2 rounded text-sm font-bold transition-all ${botLevel === level ? 'bg-[#81b64c] text-black shadow-[0_2px_10px_#81b64c55]' : 'bg-[#3c3a37] text-white hover:bg-[#4d4b48]'}`}
                   >
                     {level === 3 ? 'Casual (3)' : 'Master (4)'}
                   </button>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
