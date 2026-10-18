import { MYSTIC_OFFERING_ADVENTURE_RANK } from "#src/services/crafting/constants";

// Whether the Mystic Offering is open to a player of this Adventure Rank
export const checkIsMysticOfferingOpen = (adventureRank: number): boolean =>
  adventureRank >= MYSTIC_OFFERING_ADVENTURE_RANK;
