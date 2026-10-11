import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";

// The reactions the standing enemies' elements brought on their own since the last step, priced and emptied. Each
// Electro-Charged tick deals its damage from the combatant whose element last charged the enemy, dropping the enemy's
// Energy to the team, and arcs on as its reach does. An enemy no combatant charged, and Burning's ticks, deal nothing
export const strikeElementalTicks = (context: KitStrikeContext): void => {
  const { characterIdCombatantMap, enemyMap, enemyTables, party } = context;
  for (const enemy of enemyMap.values()) {
    const { electroChargedCombatant, elementalReactions } = enemy;
    if (elementalReactions.length === 0) continue;
    const ticks = elementalReactions.filter(
      ({ reactionType }) => reactionType === TransformativeReactionType.ElectroCharged,
    );
    elementalReactions.length = 0;
    if (!electroChargedCombatant || ticks.length === 0 || [EnemyState.Dead, EnemyState.Return].includes(enemy.state))
      continue;
    const { reachingReactions, transformativeDamage } = priceEnemyReactions(
      getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId),
      enemy,
      ticks,
      electroChargedCombatant,
      undefined,
    );
    for (const energyDrop of damageEnemy(enemy, { damage: transformativeDamage, poiseDamage: 0 }))
      gainPartyEnergy(party, energyDrop, electroChargedCombatant.element, characterIdCombatantMap);
    landKitReactionReaches(
      reachingReactions.map((reaction): [Enemy, TransformativeReaction] => [enemy, reaction]),
      electroChargedCombatant,
      context,
    );
  }
};
