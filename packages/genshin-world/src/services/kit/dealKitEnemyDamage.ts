import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyHit } from "#src/models/enemy/EnemyHit";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { triggerKitNightsoulBurst } from "#src/services/kit/triggerKitNightsoulBurst";

// The one point every damage a kit writes into an enemy goes through, in place: a hit, a tick, a reaction or a reach.
// And the Energy it drops. Damage a party member deals sets off the team's Nightsoul burst when it is
// Elemental and takes health Off the enemy, so a Physical hit sets none off, nor does one on an enemy already
// Dead, and a reaction's Elemental damage sets one off alone
export const dealKitEnemyDamage = (
  enemy: Enemy,
  hit: EnemyHit,
  isElemental: boolean,
  striker: Combatant | undefined,
  context: KitContext,
): EnergyDrop[] => {
  const healthBefore = enemy.health;
  const energyDrops = damageEnemy(enemy, hit);
  if (isElemental && enemy.health < healthBefore && striker) triggerKitNightsoulBurst(enemy, striker, context);
  return energyDrops;
};
