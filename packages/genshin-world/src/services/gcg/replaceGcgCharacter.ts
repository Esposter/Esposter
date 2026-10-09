import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { takeOne } from "@esposter/shared";

// The side whose active character fell names the standing character that takes its place. A free action, which the side
// May take whenever its replacement is owed, and which does not pass the turn
export const replaceGcgCharacter = (duel: GcgDuel, sideIndex: number, characterIndex: number): GcgActionResult => {
  if (duel.phase !== GcgPhase.Action) return GcgActionResult.WrongPhase;
  const side = takeOne(duel.sides, sideIndex);
  const next = side.characters.at(characterIndex);
  if (!side.isReplacementPending || !next || next.hp <= 0) return GcgActionResult.Unavailable;
  side.activeIndex = characterIndex;
  side.isReplacementPending = false;
  return GcgActionResult.Done;
};
