import React, { useEffect, useState } from 'react';
import type { Dungeon } from '@prisma/client';
import { initGame } from '@/game';
import type { Game } from '@/game';
import type { GameMode } from '@/types';

type GameProps = {
  dungeon: Dungeon,
  mode: GameMode,
  gameRef?: (game: Game|null) => void,
};

export function GameContainer({ dungeon, mode, gameRef }: GameProps) {
  const [mountRef, setMountRef] = useState<HTMLDivElement|null>(null);

  useEffect(() => {
    if (!mountRef) return;

    const game = initGame(mountRef, dungeon, mode);
    if (gameRef) gameRef(game);
    
    return () => {
      if (gameRef) gameRef(null);
      if (game) game.destroy();
    };
  }, [mountRef, dungeon, mode, gameRef]);

  return (
    <div ref={setMountRef} />
  );
}
