import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentLevelMap } from "#src/models/character/TalentLevelMap";
import type { TalentLevels } from "#src/models/character/TalentLevels";

import { COMBAT_TALENT_ORDER } from "#src/services/character/constants";

// Each combat talent's level keyed by its proud skill group's id, the key a kit's parameters name the group by
export const createTalentLevelMap = (
  talentGroupIds: Record<CombatTalent, number>,
  talentLevels: TalentLevels,
): TalentLevelMap =>
  Object.fromEntries(COMBAT_TALENT_ORDER.map((talent) => [talentGroupIds[talent], talentLevels[talent]]));
