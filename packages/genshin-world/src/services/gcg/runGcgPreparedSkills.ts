import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { resolveGcgSkillDamage } from "#src/services/gcg/effects/resolveGcgSkillDamage";
import { runGcgSkillEffectAndOnUse } from "#src/services/gcg/effects/runGcgSkillEffectAndOnUse";
import { takeOne } from "@esposter/shared";

// Runs the skills a side prepared on an earlier turn, as its turn begins and before the cards on its field deal theirs. Each
// Runs for the character that prepared it while that character still stands: its damage, its after-effect, then the on-use
// Hooks of its field, as a skill's own. A skill it prepares while another runs waits for the turn after
export const runGcgPreparedSkills = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  const prepared = side.preparedSkills ?? [];
  side.preparedSkills = [];
  for (const { characterIndex, skill } of prepared) {
    if (duel.phase === GcgPhase.Ended) return;
    if ((side.characters.at(characterIndex)?.hp ?? 0) <= 0) continue;
    const context: GcgEffectContext = { characterIndex, duel, sideIndex, skill };
    // The holder's prepared skill is a use by the holder, so the cards on its field hear it as they hear a skill used
    runGcgSkillEffectAndOnUse(context, characterIndex, skill, resolveGcgSkillDamage(context, skill));
  }
};
