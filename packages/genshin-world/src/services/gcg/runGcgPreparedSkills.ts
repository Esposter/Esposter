import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { parseGcgDamageEffect } from "#src/services/gcg/effects/parseGcgDamageEffect";
import { takeOne } from "@esposter/shared";

// Runs the skills a side prepared on an earlier turn, as its turn begins and before the cards on its field deal theirs. Each
// Runs for the character that prepared it while that character still stands: its damage, then its after-effect, as a skill's
// Own. A skill it prepares while another runs waits for the turn after
export const runGcgPreparedSkills = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  const prepared = side.preparedSkills ?? [];
  side.preparedSkills = [];
  for (const { characterIndex, skill } of prepared) {
    if (duel.phase === GcgPhase.Ended) return;
    if ((side.characters.at(characterIndex)?.hp ?? 0) <= 0) continue;
    const context: GcgEffectContext = { characterIndex, duel, sideIndex, skill };
    const skillModule = GcgEffectNameSkillModuleMap.get(skill.effect);
    const damage = parseGcgDamageEffect(skill.effect) ?? skillModule?.getDamage?.(context);
    if (damage) applyGcgDamage(duel, sideIndex, damage, duel.rule, context);
    skillModule?.afterDamage?.(context);
  }
};
