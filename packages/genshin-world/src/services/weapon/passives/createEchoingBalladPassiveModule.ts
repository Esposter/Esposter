import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const ECHOING_BALLAD_COOLDOWN_ID = "echoingBallad";

// Skyward Harp's Echoing Ballad at its rank: the rank's CRIT DMG is the table's line, which the passive does not repeat. A hit of the wielder's
// Own attack has the rank's chance to queue a Physical small AoE at the rank's multiplier of ATK, once every rank's cooldown in seconds.
// A passive's own queued hit has no attack tag, so it queues nothing
export const createEchoingBalladPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 1);
  const talentMultiplier = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag === undefined ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, ECHOING_BALLAD_COOLDOWN_ID) ||
        context.random() >= chance
      )
        return;
      queueCooldownHit(context, combatant, ECHOING_BALLAD_COOLDOWN_ID, cooldownSeconds, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
