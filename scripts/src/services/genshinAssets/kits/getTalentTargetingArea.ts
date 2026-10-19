import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { AttackArea } from "genshin-world";

import { CombatTalent, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "genshin-world";

// The area a talent's hit is targeted within, as its action's is: the strikes' for the normal attack's group, which
// Holds its strikes, its charged attack and its plunges, and the skill's for a skill's or a burst's
export const getTalentTargetingArea = (
  proudSkillGroupId: number,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
): AttackArea =>
  proudSkillGroupId === talentGroupIdMap[CombatTalent.NormalAttack] ? STRIKE_TARGETING_AREA : SKILL_TARGETING_AREA;
