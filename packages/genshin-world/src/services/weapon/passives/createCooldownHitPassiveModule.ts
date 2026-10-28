import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";

// The core of the cooldown hit passives: a passive whose wielder's own hits, the ones its predicate names, each roll the rank's
// Chance of an extra hit built from the hit that landed. A roll that passes queues it once the cooldown has run out, so a roll
// Inside the cooldown queues nothing. The extra hit lands on the enemy getTarget names, or on the default target without one
export const createCooldownHitPassiveModule = ({
  buildHit,
  chance,
  checkIsProcAttack,
  cooldownId,
  cooldownSeconds,
  getTarget,
}: {
  buildHit: (event: KitDamageTakenEvent) => KitHit;
  chance: number;
  checkIsProcAttack: (attackTag: AttackTag | undefined) => boolean;
  cooldownId: string;
  cooldownSeconds: number;
  getTarget?: (event: KitDamageTakenEvent) => Enemy;
}): PassiveModule => ({
  onKitEvent: (event, context, combatant) => {
    if (
      event.kind !== KitEventKind.DamageTaken ||
      event.striker.characterId !== combatant.characterId ||
      !checkIsProcAttack(event.attackTag) ||
      context.random() >= chance
    )
      return;
    queueCooldownHit(context, combatant, cooldownId, cooldownSeconds, buildHit(event), getTarget?.(event));
  },
});
