import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyHit } from "#src/models/enemy/EnemyHit";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";

// Damage a kit's own tick or Lunar hit deals an enemy, written into it in place, and the energy it drops. A standing
// Enemy that this damage takes to no health is sent to the team's kits as defeated, from the combatant that owns it if
// One does, and an enemy already dead is left as it is
export const damageKitEnemy = (
  enemy: Enemy,
  hit: EnemyHit,
  owner: Combatant | undefined,
  context: KitContext,
): EnergyDrop[] => {
  const isStanding = enemy.state !== EnemyState.Dead;
  const energyDrops = damageEnemy(enemy, hit);
  if (isStanding && enemy.state === EnemyState.Dead)
    emitKitEvent({ enemy, kind: KitEventKind.EnemyDefeated, striker: owner }, context);
  return energyDrops;
};
