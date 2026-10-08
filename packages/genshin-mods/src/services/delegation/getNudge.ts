import { DELEGATION_NUDGE, DELEGATION_NUDGE_EVERY } from "../constants";

// The nudge owed by a streak: on the third lookup in a row and every third after it
export const getNudge = (streak: number): string | undefined =>
  streak > 0 && streak % DELEGATION_NUDGE_EVERY === 0 ? DELEGATION_NUDGE : undefined;
