import type { KitContext } from "#src/models/kit/KitContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { STELLAR_VORTEX_LEVEL_TWO_STACKS } from "#src/services/combat/damage/constants";
import { getStellarVortexCoefficient } from "#src/services/combat/damage/getStellarVortexCoefficient";
import { STELLAR_VORTEX_LEVEL_ONE_RADIUS, STELLAR_VORTEX_LEVEL_TWO_RADIUS } from "#src/services/kit/constants";
import { strikeStellarReaction } from "#src/services/kit/strikeStellarReaction";

// A Stellar Vortex's explosion: Cryo damage to each living enemy within its radius, which its third stack widens, at the
// Coefficient its stacks give, priced for the combatant that cast it as the one contributor
export const detonateStellarVortex = (vortex: KitSummon, context: KitContext): void => {
  const { combatant, stacks = 0 } = vortex;
  const { x, z } = vortex.body.position;
  const radius =
    stacks >= STELLAR_VORTEX_LEVEL_TWO_STACKS ? STELLAR_VORTEX_LEVEL_TWO_RADIUS : STELLAR_VORTEX_LEVEL_ONE_RADIUS;
  const coefficient = getStellarVortexCoefficient(stacks);
  for (const enemy of context.enemyMap.values()) {
    if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) continue;
    if (Math.hypot(enemy.position.x - x, enemy.position.z - z) > radius) continue;
    strikeStellarReaction(enemy, Element.Cryo, coefficient, new Set([combatant.characterId]), combatant, context);
  }
};
