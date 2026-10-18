import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyHit } from "#src/models/enemy/EnemyHit";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { dealKitEnemyDamage } from "#src/services/kit/dealKitEnemyDamage";
import { emitKitEnemyDefeated } from "#src/services/kit/emitKitEnemyDefeated";

// Damage a kit's own tick or Lunar hit deals an enemy, written into it in place, and the energy it drops, through the damage
// Point. A standing Enemy that this damage takes to no health is sent to the team's kits as defeated, from the combatant
// That owns it if One does, and an enemy already dead is left as it is
export const damageKitEnemy = (
  enemy: Enemy,
  hit: EnemyHit,
  isElemental: boolean,
  owner: Combatant | undefined,
  context: KitContext,
): EnergyDrop[] => {
  const isStanding = enemy.state !== EnemyState.Dead;
  const energyDrops = dealKitEnemyDamage(enemy, hit, isElemental, owner, context);
  if (isStanding) emitKitEnemyDefeated(enemy, owner, context);
  return energyDrops;
};
