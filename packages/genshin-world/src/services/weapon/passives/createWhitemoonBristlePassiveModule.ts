import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { createAttackInstancePassiveModule } from "#src/services/weapon/passives/createAttackInstancePassiveModule";
import { takeOne } from "@esposter/shared";

// Whitemoon Bristle at its rank: after a Normal Attack deals Elemental DMG, the wielder obtains Foliar Incision, once every
// Cooldown. It adds the rank's share of Elemental Mastery as base damage to the Normal Attack and Elemental Skill hits the
// Wielder deals, and ends after the rank's DMG instances or seconds, whichever comes first. The instances counted are the
// Ones those two hits deal once it is obtained. The rank's CRIT Rate line is a table line the weapon carries whatever its
// Conditions, so this passive does not repeat it
export const createWhitemoonBristlePassiveModule = (params: number[]): WeaponPassiveModule =>
  createAttackInstancePassiveModule({
    attackTags: [AttackTag.NormalAttack, AttackTag.ElementalSkill],
    checkIsObtainedBy: (event) => event.attackTag === AttackTag.NormalAttack && event.hit.element !== undefined,
    cooldownSeconds: takeOne(params, 4),
    id: "foliarIncision",
    maximumInstances: takeOne(params, 2),
    masteryShare: takeOne(params, 1),
    seconds: takeOne(params, 3),
  });
