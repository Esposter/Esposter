import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import type { GcgPhase } from "#src/models/gcg/GcgPhase";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

// A duel between two sides: its phase and round, the side that goes first this round and the one whose turn it is, the
// Side that declared its round's end first and so goes first next round, the rule it runs, and how it ended, with the winner
// Once one won
export interface GcgDuel {
  actingSideIndex: number;
  // The card and skill modules the duel's hooks run, held here so the damage pipeline reaches them without importing the cards
  cardModules: ReadonlyMap<number, GcgCardModule>;
  firstSideIndex: number;
  nextFirstSideIndex: number;
  outcome?: GcgOutcome;
  phase: GcgPhase;
  // The seeded source the duel's dice are rolled from and its decks shuffled with, held here so every draw reads one source
  random: () => number;
  round: number;
  rule: GcgRule;
  sides: [GcgSideState, GcgSideState];
  skillModules: ReadonlyMap<string, GcgSkillModule>;
  winnerSideIndex?: number;
}
