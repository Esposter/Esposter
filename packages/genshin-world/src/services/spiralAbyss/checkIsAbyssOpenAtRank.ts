import { ABYSS_OPEN_ADVENTURE_RANK } from "#src/services/spiralAbyss/constants";

// Whether the Spiral Abyss is open to a player of this Adventure Rank, from the rank it opens at on
export const checkIsAbyssOpenAtRank = (adventureRank: number): boolean => adventureRank >= ABYSS_OPEN_ADVENTURE_RANK;
