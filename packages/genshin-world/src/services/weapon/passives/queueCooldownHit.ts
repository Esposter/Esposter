import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";

// A passive's extra hit that waits on a cooldown: queued, and the cooldown started, only once the cooldown has run out, so
// A hit inside it queues nothing. Reports whether it queued the hit
export const queueCooldownHit = (
  context: KitContext,
  combatant: Combatant,
  cooldownId: string,
  cooldownSeconds: number,
  hit: KitHit,
  target?: Enemy,
): boolean => {
  if (!startKitCooldown(context.kitEffectState, combatant.characterId, cooldownId, cooldownSeconds)) return false;
  queueKitPassiveHit(context, combatant, hit, target);
  return true;
};
