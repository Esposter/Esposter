import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";

export const sliceBandLevels = ({ floor, game, ours }: BandLevels, start: number, end?: number): BandLevels => ({
  floor,
  game: game.slice(start, end),
  ours: ours.slice(start, end),
});
