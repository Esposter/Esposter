import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { AttackTag } from "#src/models/combat/AttackTag";
import { createAttackTagDamageSetModule } from "#src/services/artifact/sets/createAttackTagDamageSetModule";
import { createUsedActionTeamBuffSetModule } from "#src/services/artifact/sets/createUsedActionTeamBuffSetModule";
import { takeOne } from "@esposter/shared";

// Noblesse Oblige. Its two-piece bonus raises the Elemental Burst DMG of each strike its wearer's burst lands by the table's
// First param, as a weapon's skill and burst passive does. Its four-piece bonus gives every deployed member the ATK in the
// Table's first param for the seconds in its second, after its wearer uses its Elemental Burst, and a use restarts it
export const createNoblesseObligeSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const { params } = bonus;
  if (bonus.pieceCount === 2)
    return createAttackTagDamageSetModule({ amount: takeOne(params, 0), attackTag: AttackTag.ElementalBurst });
  return createUsedActionTeamBuffSetModule({
    actions: [CombatTalent.ElementalBurst],
    amount: takeOne(params, 0),
    attribute: Attribute.AttackPercent,
    seconds: takeOne(params, 1),
    source: "Noblesse Oblige",
  });
};
