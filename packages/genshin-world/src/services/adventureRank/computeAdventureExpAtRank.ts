import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";

// The Adventure EXP a rank is reached at: the EXP of every rank below it, so rank 1 is reached at none
export const computeAdventureExpAtRank = (levels: readonly AdventureRankLevel[], rank: number): number =>
  levels.filter(({ level }) => level < rank).reduce((total, { exp }) => total + exp, 0);
