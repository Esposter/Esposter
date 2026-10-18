import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";
import type { TalentLevels } from "#src/models/character/TalentLevels";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { getConstellationTalentAdditions } from "#src/services/character/getConstellationTalentAdditions";

// The level each combat talent plays at: the level the character holds for it plus the levels its active constellations
// Add to it, which is the level a kit reads the talent at. Materials never pay for the added levels, so a level past ten
// Is a constellation's alone
export const getPlayedTalentLevels = (
  { constellationCount, talentLevels }: Pick<Character, "constellationCount" | "talentLevels">,
  constellations: readonly Constellation[],
): TalentLevels => {
  const additions = getConstellationTalentAdditions(constellations, constellationCount);
  return {
    [CombatTalent.ElementalBurst]: talentLevels[CombatTalent.ElementalBurst] + additions[CombatTalent.ElementalBurst],
    [CombatTalent.ElementalSkill]: talentLevels[CombatTalent.ElementalSkill] + additions[CombatTalent.ElementalSkill],
    [CombatTalent.NormalAttack]: talentLevels[CombatTalent.NormalAttack] + additions[CombatTalent.NormalAttack],
  };
};
