import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { damageKitEnemy } from "#src/services/kit/damageKitEnemy";

// A reaction's own hit written into the enemy in place: its damage before RES, taken against the enemy's RES to the
// Element, its energy dropping to the team as the element of the member who owns it
export const strikeReactionDamage = (
  enemy: Enemy,
  element: Element,
  damage: number,
  owner: Combatant | undefined,
  context: KitContext,
): void => {
  const { enemyTables } = context;
  const kind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
  const resistance = getEnemyResistance(kind, enemy, element);
  collectKitEnergyDrops(
    damageKitEnemy(enemy, { damage: damage * getResistanceMultiplier(resistance), poiseDamage: 0 }, owner, context),
    owner?.element,
    context,
  );
};
