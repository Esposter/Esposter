import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { createCooldownHitPassiveModule } from "#src/services/weapon/passives/createCooldownHitPassiveModule";

// A passive whose wielder's own normal or charged attack that hits an enemy has the rank's chance of an extra hit on that
// Enemy, built from the hit that landed, once every cooldown in seconds. A roll inside the cooldown draws nothing, and a hit
// That is not the wielder's own attack draws no roll at all
export const createAttackCooldownHitPassiveModule = ({
  buildHit,
  chance,
  cooldownId,
  cooldownSeconds,
}: {
  buildHit: (event: KitDamageTakenEvent) => KitHit;
  chance: number;
  cooldownId: string;
  cooldownSeconds: number;
}): PassiveModule =>
  createCooldownHitPassiveModule({
    buildHit,
    chance,
    checkIsProcAttack: checkIsNormalOrChargedAttack,
    cooldownId,
    cooldownSeconds,
    getTarget: (event) => event.enemy,
  });
