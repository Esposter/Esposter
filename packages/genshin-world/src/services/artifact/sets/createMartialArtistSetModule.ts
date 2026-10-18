import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { createAfterSkillAttackDamageSetModule } from "#src/services/artifact/sets/createAfterSkillAttackDamageSetModule";
import { createAttributePassiveSetModule } from "#src/services/artifact/sets/createAttributePassiveSetModule";
import { takeOne } from "@esposter/shared";

// Martial Artist's two-piece bonus, its amount of Normal and Charged Attack DMG in the table's first param, and
// Its four-piece bonus, which gives the same two for the seconds in the table's first param after the Elemental Skill, at
// The amount in its third. The second param, 1, is left unread, as a use restarts the buff rather than stacking it
export const createMartialArtistSetModule = (bonus: ArtifactSetBonus): ArtifactSetModule => {
  const { params } = bonus;
  if (bonus.pieceCount === 2)
    return createAttributePassiveSetModule(
      [Attribute.NormalAttackDamageBonus, Attribute.ChargedAttackDamageBonus],
      takeOne(params, 0),
    );
  return createAfterSkillAttackDamageSetModule({
    amount: takeOne(params, 2),
    seconds: takeOne(params, 0),
    source: "Martial Artist",
  });
};
