import React from 'react';
import GameInterface from '../Interfaces.ts';
import { GameContextType } from './@types.game.ts';

export const GameContext = React.createContext<GameContextType | undefined>(undefined);

export default function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = React.useState<GameInterface | undefined>(undefined);

  function updateGame(newGame: GameInterface)
  {
    setGame(newGame);
  }

  return (
    <GameContext.Provider value={{ game, updateGame }}>
      {children}
    </GameContext.Provider>
  );
}
