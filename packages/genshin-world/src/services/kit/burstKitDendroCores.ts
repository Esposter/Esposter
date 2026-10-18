import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { GroundPoint } from "genshin-engine";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { HYPERBLOOM_HOMING_RADIUS } from "#src/services/combat/dendroCore/constants";
import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The standing enemy nearest a point within a radius of it, measured to the enemy's edge, if one stands there
const selectNearestEnemy = ({ x, z }: GroundPoint, enemies: Iterable<Enemy>, radius: number): Enemy | undefined => {
  let nearestEnemy: Enemy | undefined;
  let nearestDistance = radius + ENEMY_CAPSULE_RADIUS;
  for (const enemy of enemies) {
    if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) continue;
    const distance = Math.hypot(enemy.position.x - x, enemy.position.z - z);
    if (distance > nearestDistance) continue;
    nearestEnemy = enemy;
    nearestDistance = distance;
  }
  return nearestEnemy;
};

// The Dendro Cores whose seconds ran out bursting on the enemies round them, each priced from its character as the
// Team's buffs leave it: a Bloom's own core about itself, only while the character whose Bloom left it stands in the
// Deployed team, a Burgeon about itself, and a Hyperbloom about the enemy nearest the core within 15 metres
export const burstKitDendroCores = (expiredEffects: readonly KitEffect[], context: KitContext): void => {
  const { characterIdCombatantMap, enemyMap, kitEffectState, party } = context;
  for (const effect of expiredEffects) {
    if (effect.kind !== "dendroCore") continue;
    const { characterId, position, reactionType } = effect;
    const combatant = characterIdCombatantMap.get(characterId);
    if (
      !combatant ||
      (reactionType === TransformativeReactionType.Bloom &&
        (!getDeployedCharacterIds(party).includes(characterId) || checkIsCharacterDown(party, characterId)))
    )
      continue;
    const target =
      reactionType === TransformativeReactionType.Hyperbloom
        ? selectNearestEnemy(position, enemyMap.values(), HYPERBLOOM_HOMING_RADIUS)
        : effect;
    if (!target) continue;
    landKitReactionReaches(
      [[{ position: target.position }, { element: Element.Dendro, reactionType }]],
      getBuffedCombatant(combatant, kitEffectState.effects, party, context.body.position),
      context,
    );
  }
};
