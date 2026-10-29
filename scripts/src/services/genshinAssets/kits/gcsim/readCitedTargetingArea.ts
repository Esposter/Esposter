import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitOverlay } from "#src/models/shared/KitOverlay";
import type { AttackArea } from "genshin-world";

import { checkIsNormalAttackPath } from "#src/services/genshinAssets/kits/gcsim/checkIsNormalAttackPath";
import { readHitGroupId } from "#src/services/genshinAssets/kits/gcsim/readHitGroupId";
import { getTalentTargetingArea } from "#src/services/genshinAssets/kits/getTalentTargetingArea";
import { CombatTalent } from "genshin-world";

// The targeting area a cited area's reach on a target is measured from, by the group of the action it belongs to: the
// Normal attack's group for a strike's path, the group of a hit's multiplier for a named hit, the skill's for any other
export const readCitedTargetingArea = (
  path: string,
  overlay: KitOverlay,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
): AttackArea =>
  getTalentTargetingArea(
    checkIsNormalAttackPath(path)
      ? talentGroupIdMap[CombatTalent.NormalAttack]
      : (readHitGroupId(path, overlay) ?? talentGroupIdMap[CombatTalent.ElementalSkill]),
    talentGroupIdMap,
  );
