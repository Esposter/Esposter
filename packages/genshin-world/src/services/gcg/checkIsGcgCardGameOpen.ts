import { GCG_OPEN_ADVENTURE_RANK } from "#src/services/gcg/constants";

// Whether the card game is open to a player of this Adventure Rank: from the rank it opens at up
export const checkIsGcgCardGameOpen = (adventureRank: number): boolean => adventureRank >= GCG_OPEN_ADVENTURE_RANK;
