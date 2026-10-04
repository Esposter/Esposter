import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";

// A band's gap frame by frame in decibels, ours raised by `gain` over the game's, ours read no quieter than the floor so
// A band quiet on both sides costs nothing
export const computeBandGaps = ({ floor, game, ours }: BandLevels, gain: number): number[] =>
  ours.map((level, frame) => Math.max(level + gain, floor) - (game[frame] ?? floor));
