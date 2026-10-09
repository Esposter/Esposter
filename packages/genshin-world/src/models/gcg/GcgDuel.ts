import type { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgPhase } from "#src/models/gcg/GcgPhase";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

// A duel between two sides: its phase and round, the side that goes first this round and the one whose turn it is, the
// Side that declared its round's end first and so goes first next round, the rule it runs, and how it ended, with the winner
// Once one won
export interface GcgDuel {
  actingSideIndex: number;
  firstSideIndex: number;
  nextFirstSideIndex: number;
  outcome?: GcgOutcome;
  phase: GcgPhase;
  round: number;
  rule: GcgRule;
  sides: [GcgSideState, GcgSideState];
  winnerSideIndex?: number;
}
