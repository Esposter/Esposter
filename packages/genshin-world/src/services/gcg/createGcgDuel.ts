import type { GcgDeck } from "#src/models/gcg/GcgDeck";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { createGcgSideState } from "#src/services/gcg/createGcgSideState";

// A duel between two decks as it opens: each side's cards shuffled and its starting hand drawn, the first round to come
// Being the first side's, and the duel waiting in its preparation for each side to switch cards and choose its active
export const createGcgDuel = (decks: [GcgDeck, GcgDeck], random: () => number): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Preparation,
  round: 1,
  sides: [createGcgSideState(decks[0], random), createGcgSideState(decks[1], random)],
  winnerSideIndex: undefined,
});
