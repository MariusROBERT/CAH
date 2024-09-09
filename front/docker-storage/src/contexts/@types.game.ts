import GameInterface from '../Interfaces.ts';

export type GameContextType = {
  game: GameInterface | undefined,
  updateGame: (game: GameInterface) => void,
}
