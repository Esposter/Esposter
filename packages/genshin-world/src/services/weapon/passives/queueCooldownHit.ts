import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
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
  if (checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, cooldownId)) return false;
  addKitStatus(context.kitEffectState, combatant.characterId, { id: cooldownId, secondsRemaining: cooldownSeconds });
  queueKitPassiveHit(context, combatant, hit, target);
  return true;
};
