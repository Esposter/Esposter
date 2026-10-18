import { IMAGINARIUM_REROLL_CHANCES } from "#src/services/imaginarium/constants";

// The rerolls a run holds after a Mystery Cache option gives it chances to reroll its events
export const gainImaginariumRerolls = (rerolls: number): number => rerolls + IMAGINARIUM_REROLL_CHANCES;
