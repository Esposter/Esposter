import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { createCooldownHitPassiveModule } from "#src/services/weapon/passives/createCooldownHitPassiveModule";
import { takeOne } from "@esposter/shared";

const GASH_COOLDOWN_ID = "gashCooldown";

// Gash at its rank: a hit its wielder deals has the rank's chance of an extra hit at the rank's multiplier of ATK on the one
// Enemy it struck, once per the rank's cooldown in seconds. A passive's own extra hit has no attack tag, so it never procs another
export const createGashPassiveModule = (params: number[]): PassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return createCooldownHitPassiveModule({
    buildHit: (event) => ({ hitArea: event.hit.hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier }),
    chance,
    checkIsProcAttack: (attackTag) => attackTag !== undefined,
    cooldownId: GASH_COOLDOWN_ID,
    cooldownSeconds,
    getTarget: (event) => event.enemy,
  });
};
