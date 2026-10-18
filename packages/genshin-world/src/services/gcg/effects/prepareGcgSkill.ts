import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { takeOne } from "@esposter/shared";

// Prepares a skill for a side's next turn, for the character at characterIndex that prepares it
export const prepareGcgSkill = (duel: GcgDuel, sideIndex: number, characterIndex: number, skill: GcgSkill): void => {
  const side = takeOne(duel.sides, sideIndex);
  side.preparedSkills = [...(side.preparedSkills ?? []), { characterIndex, skill }];
};
