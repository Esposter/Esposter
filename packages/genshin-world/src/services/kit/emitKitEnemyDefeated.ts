import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";

// Sends an enemy's defeat to the team's kits, from the combatant that dealt the damage that defeated it, if it is Dead
export const emitKitEnemyDefeated = (enemy: Enemy, striker: Combatant | undefined, context: KitContext): void => {
  if (enemy.state === EnemyState.Dead) emitKitEvent({ enemy, kind: KitEventKind.EnemyDefeated, striker }, context);
};
