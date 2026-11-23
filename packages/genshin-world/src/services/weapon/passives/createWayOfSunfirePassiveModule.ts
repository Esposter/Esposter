import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const SUNFIRE_ARROW_COOLDOWN_ID = "wayOfSunfireArrowCooldown";
const HEARTSEARER_ID = "heartsearer";

// The Way of Sunfire at its rank: a Charged Attack hit its wielder lands queues a Sunfire Arrow at the rank's
// Multiplier of ATK On the enemy it struck, once every the rank's cooldown in seconds, and the arrow gives that enemy
// Heartsearer for the rank's Seconds, while the wielder's Charged Attacks deal the rank's amount more DMG to it
export const createWayOfSunfirePassiveModule = (params: number[]): PassiveModule => {
  const cooldownSeconds = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const damageBonus = takeOne(params, 3);
  return {
    getStrikeDamageBonus: (strike, enemy) =>
      strike.attackTag === AttackTag.ChargedAttack && enemy.statuses.some(({ id }) => id === HEARTSEARER_ID)
        ? damageBonus
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ChargedAttack
      )
        return;
      if (
        queueCooldownHit(
          context,
          combatant,
          SUNFIRE_ARROW_COOLDOWN_ID,
          cooldownSeconds,
          { hitArea: event.hit.hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier },
          event.enemy,
        )
      )
        addEnemyStatus(event.enemy, { damageTakenBonus: 0, id: HEARTSEARER_ID, secondsRemaining: seconds });
    },
  };
};
