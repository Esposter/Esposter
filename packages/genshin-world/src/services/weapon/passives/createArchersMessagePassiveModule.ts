import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const ARCHERS_MESSAGE_COOLDOWN_ID = "archersMessage";
const ARCHERS_MESSAGE_COOLDOWN_SECONDS = 10;

// Archer's Message at its rank: a Charged Attack hit on a weak point queues an extra hit on the enemy it struck
// At the rank's multiplier of ATK, which always lands as a critical hit, and a proc holds off the next for ten seconds
export const createArchersMessagePassiveModule = (params: number[]): WeaponPassiveModule => {
  const talentMultiplier = takeOne(params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ChargedAttack ||
        !event.hit.weakPoint
      )
        return;
      queueCooldownHit(
        context,
        combatant,
        ARCHERS_MESSAGE_COOLDOWN_ID,
        ARCHERS_MESSAGE_COOLDOWN_SECONDS,
        { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, isForcedCritical: true, poiseDamage: 0, talentMultiplier },
        event.enemy,
      );
    },
  };
};
