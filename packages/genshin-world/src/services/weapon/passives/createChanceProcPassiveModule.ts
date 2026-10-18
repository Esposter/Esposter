import type { AttackTag } from "#src/models/combat/AttackTag";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";

// A passive whose wielder's own hits, the ones its predicate names, each roll the rank's chance of an extra hit on the small
// AoE at the rank's multiplier of ATK. A roll that passes queues the hit once the cooldown has run out, so a roll inside the
// Cooldown queues nothing
export const createChanceProcPassiveModule = ({
  chance,
  checkIsProcAttack,
  cooldownId,
  cooldownSeconds,
  talentMultiplier,
}: {
  chance: number;
  checkIsProcAttack: (attackTag: AttackTag | undefined) => boolean;
  cooldownId: string;
  cooldownSeconds: number;
  talentMultiplier: number;
}): PassiveModule => ({
  onKitEvent: (event, context, combatant) => {
    if (
      event.kind !== KitEventKind.DamageTaken ||
      event.striker.characterId !== combatant.characterId ||
      !checkIsProcAttack(event.attackTag) ||
      context.random() >= chance
    )
      return;
    queueCooldownHit(context, combatant, cooldownId, cooldownSeconds, {
      hitArea: SMALL_AOE_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier,
    });
  },
});
