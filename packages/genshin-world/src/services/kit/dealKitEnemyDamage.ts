import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyHit } from "#src/models/enemy/EnemyHit";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { WorldEffectKind } from "#src/models/effects/WorldEffectKind";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { addWorldEffect } from "#src/services/effects/addWorldEffect";
import { ENERGY_DROP_SECONDS } from "#src/services/effects/constants";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { triggerKitNightsoulBurst } from "#src/services/kit/triggerKitNightsoulBurst";

// The one point every damage a kit writes into an enemy goes through, in place: a hit, a tick, a reaction or a reach.
// And the Energy it drops. Damage a party member deals sets off the team's Nightsoul burst when it is Elemental and
// Deals damage, a shield's share included, as gcsim's OnEnemyDamage handler reads it. A Physical hit sets none off, nor
// Does one on an enemy already Dead, and a reaction's Elemental damage sets one off alone
export const dealKitEnemyDamage = (
  enemy: Enemy,
  hit: EnemyHit,
  isElemental: boolean,
  striker: Combatant | undefined,
  context: KitContext,
): EnergyDrop[] => {
  const isAlive = enemy.state !== EnemyState.Dead;
  const energyDrops = damageEnemy(enemy, hit);
  // A defeated enemy's energy drops fly from where it fell to the member on the field, which collects them
  if (enemy.state === EnemyState.Dead)
    for (const _ of energyDrops)
      addWorldEffect(context.worldEffects, {
        kind: WorldEffectKind.EnergyDrop,
        position: enemy.position,
        seconds: ENERGY_DROP_SECONDS,
        target: context.body.position,
      });
  if (isElemental && isAlive && hit.damage > 0 && striker) triggerKitNightsoulBurst(enemy, striker, context);
  return energyDrops;
};
