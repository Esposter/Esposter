import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { createAfterSkillAttackDamageSetModule } from "#src/services/artifact/sets/createAfterSkillAttackDamageSetModule";
import { takeOne } from "@esposter/shared";

// Heart of Depth's four-piece bonus: its amount of Normal and Charged Attack DMG in the table's first param, and
// The seconds it lasts in its third, after its wearer's Elemental Skill. The second param, 1, is left unread
export const createHeartOfDepthSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule =>
  createAfterSkillAttackDamageSetModule({
    amount: takeOne(params, 0),
    seconds: takeOne(params, 2),
    source: "Heart of Depth",
  });
