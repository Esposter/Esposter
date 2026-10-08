import { ADVENTURE_RANK_LEVELS } from "#src/services/adventureRank/constants";

// The Adventure EXP a rank is reached at: the EXP of every rank below it, so rank 1 is reached at none
export const computeAdventureExpAtRank = (rank: number): number =>
  ADVENTURE_RANK_LEVELS.filter(({ level }) => level < rank).reduce((total, { exp }) => total + exp, 0);
