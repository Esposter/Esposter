import { MINING_OUTCROP_ADVENTURE_RANK } from "#src/services/leyLine/constants";

// Whether a region's mining outcrops are drawn at this Adventure Rank
export const checkIsMiningOutcropOpen = (adventureRank: number): boolean =>
  adventureRank >= MINING_OUTCROP_ADVENTURE_RANK;
