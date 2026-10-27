import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { createAttackCooldownHitPassiveModule } from "#src/services/weapon/passives/createAttackCooldownHitPassiveModule";
import { takeOne } from "@esposter/shared";

const BOLT_COOLDOWN_ID = "boltOfPerceptionCooldown";

// Echo at its rank: a normal or charged attack its wielder lands has the rank's chance of a Bolt of Perception, an extra hit at
// The rank's multiplier of ATK on the enemy it struck, once every the rank's cooldown in seconds. The bolt's bounces, which the
// Text gives as a maximum of four, are not modelled, so the bolt is a single hit provisionally
export const createBoltOfPerceptionPassiveModule = (params: number[]): PassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return createAttackCooldownHitPassiveModule({
    buildHit: (event) => ({ hitArea: event.hit.hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier }),
    chance,
    cooldownId: BOLT_COOLDOWN_ID,
    cooldownSeconds,
  });
};
