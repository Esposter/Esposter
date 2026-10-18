import { IMAGINARIUM_REROLL_COST } from "#src/services/imaginarium/constants";
import { spendImaginariumCount } from "#src/services/imaginarium/spendImaginariumCount";

// An act's events after a reroll: a fresh set drawn and one reroll spent when the run holds one, the same set kept and no
// Reroll spent when it holds none. The draw is the act's own, given by the caller
export const rerollImaginariumEvents = <TEvent>(
  events: TEvent[],
  rerolls: number,
  drawEvents: () => TEvent[],
): { events: TEvent[]; rerolls: number } => {
  const { count, isSpent } = spendImaginariumCount(rerolls, IMAGINARIUM_REROLL_COST);
  return isSpent ? { events: drawEvents(), rerolls: count } : { events, rerolls };
};
