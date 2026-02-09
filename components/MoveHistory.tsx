
import React, { useEffect, useRef } from 'react';
import { Move } from 'chess.js';

interface MoveHistoryProps {
  history: Move[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || null
    });
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-0 bg-[#262421]">
      {pairs.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[#5c5b58] text-sm italic py-20">
          No moves yet. Good luck!
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#211f1c] text-[10px] uppercase text-[#5c5b58] font-black">
              <th className="px-4 py-2 w-12 text-center">#</th>
              <th className="px-4 py-2">White</th>
              <th className="px-4 py-2">Black</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, idx) => (
              <tr key={pair.num} className={`${idx % 2 === 0 ? 'bg-[#2b2926]' : 'bg-[#262421]'} hover:bg-[#3c3a37] transition-colors`}>
                <td className="px-4 py-1.5 text-center text-[#5c5b58] font-bold text-xs bg-[#211f1c]/50">{pair.num}</td>
                <td className="px-4 py-1.5 text-[#bababa] font-semibold text-sm cursor-pointer">{pair.white.san}</td>
                <td className="px-4 py-1.5 text-[#bababa] font-semibold text-sm cursor-pointer">{pair.black?.san || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MoveHistory;
