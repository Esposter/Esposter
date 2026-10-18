import type { GcgSideState } from "#src/models/gcg/GcgSideState";

// How many times a card has triggered this Round, counted from the side's used card ids
export const countGcgCardUses = (side: GcgSideState, cardId: number): number =>
  side.usedCardIds.filter((usedId) => usedId === cardId).length;
