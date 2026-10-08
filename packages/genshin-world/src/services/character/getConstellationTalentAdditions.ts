import type { Constellation } from "#src/models/character/Constellation";
import type { TalentLevels } from "#src/models/character/TalentLevels";

import { CombatTalent } from "#src/models/character/CombatTalent";

// The levels each combat talent gains from a character's active constellations, each raise of an active one added to the
// Talent it names. A kit reads a talent at its own level plus these, which the materials never pay for
export const getConstellationTalentAdditions = (
  constellations: readonly Constellation[],
  constellationCount: number,
): TalentLevels => {
  const additions: TalentLevels = {
    [CombatTalent.ElementalBurst]: 0,
    [CombatTalent.ElementalSkill]: 0,
    [CombatTalent.NormalAttack]: 0,
  };
  for (const { raise } of constellations.slice(0, constellationCount))
    if (raise) additions[raise.talent] += raise.levels;
  return additions;
};
