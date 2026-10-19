import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createChanceProcPassiveModule } from "#src/services/weapon/passives/createChanceProcPassiveModule";
import { takeOne } from "@esposter/shared";

const WANDERING_CLOUDS_COOLDOWN_ID = "wanderingClouds";

// Skyward Atlas's Wandering Clouds at its rank: its Elemental DMG Bonus is a passive bonus on the wielder. A Normal Attack hit
// Of the wielder's own has the rank's chance to earn the favour of the clouds, which queues a physical small AoE at the rank's
// Multiplier of ATK, once every rank's cooldown in seconds. The clouds' fifteen seconds of seeking out opponents are not modelled
// Beyond that single hit, which is provisional
export const createWanderingCloudsPassiveModule = (params: number[]): PassiveModule => ({
  getPassiveBonuses: () =>
    ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: takeOne(params, 0), attribute })),
  ...createChanceProcPassiveModule({
    chance: takeOne(params, 1),
    checkIsProcAttack: (attackTag) => attackTag === AttackTag.NormalAttack,
    cooldownId: WANDERING_CLOUDS_COOLDOWN_ID,
    cooldownSeconds: takeOne(params, 3),
    talentMultiplier: takeOne(params, 2),
  }),
});
