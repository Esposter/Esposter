import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitbox } from "#src/models/kit/KitHitbox";

import { STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";

// A hit a kit fires at its hitmark, striking the enemies in a circle round the enemy it lands on. The record's reach is the
// Strike's targeting reach plus the circle's radius, so the circle is the reach less the targeting reach. Without a target
// the strike selects the enemy it lands on
export const scheduleKitHitStrike = (
  kitEffectState: KitEffectState,
  combatant: Combatant,
  hit: KitHit,
  target?: Enemy,
): void => {
  const hitbox: KitHitbox = {
    offset: { x: 0, z: 0 },
    shape: { kind: "circle", radius: hit.hitArea.radius - STRIKE_TARGETING_AREA.radius },
  };
  scheduleKitTask(kitEffectState, combatant.characterId, hit.hitmarkSeconds, (tick) =>
    strikeKitEnemies([{ body: tick.body, combatant, hit, hitbox, target }], tick),
  );
};
