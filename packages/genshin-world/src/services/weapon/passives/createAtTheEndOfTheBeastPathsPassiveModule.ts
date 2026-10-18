import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { createAttackInstancePassiveModule } from "#src/services/weapon/passives/createAttackInstancePassiveModule";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

// At the End of the Beast-Paths at its rank: the rank's All Elemental DMG Bonus is a passive bonus on each element. After a
// Charged Attack, the wielder obtains Tireless Hunt, once every cooldown. It adds the rank's share of Elemental Mastery as base
// Damage to the Charged Attacks it deals, and ends after the rank's Charged Attacks or seconds, whichever comes first
export const createAtTheEndOfTheBeastPathsPassiveModule = (params: number[]): WeaponPassiveModule => {
  const elementalDamageBonus = takeOne(params, 0);
  const huntPassiveModule = createAttackInstancePassiveModule({
    attackTags: [AttackTag.ChargedAttack],
    checkIsObtainedBy: (event) => event.attackTag === AttackTag.ChargedAttack,
    cooldownSeconds: takeOne(params, 4),
    id: "tirelessHunt",
    maximumInstances: takeOne(params, 2),
    masteryShare: takeOne(params, 1),
    seconds: takeOne(params, 3),
  });
  return {
    ...huntPassiveModule,
    getPassiveBonuses: () =>
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: elementalDamageBonus, attribute })),
  };
};
