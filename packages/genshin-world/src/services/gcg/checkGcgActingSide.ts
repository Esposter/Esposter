import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { takeOne } from "@esposter/shared";

// Why a side may not take a turn action now, or nothing when it may: the action phase, its own turn, and no replacement
// Still owed for a defeated active character
export const checkGcgActingSide = (duel: GcgDuel, sideIndex: number): GcgActionResult | undefined => {
  if (duel.phase !== GcgPhase.Action) return GcgActionResult.WrongPhase;
  else if (duel.actingSideIndex !== sideIndex) return GcgActionResult.WrongSide;
  else if (takeOne(duel.sides, sideIndex).isReplacementPending) return GcgActionResult.ReplacementPending;
  return undefined;
};
