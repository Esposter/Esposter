import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitCrystallizeShard } from "#src/models/kit/KitCrystallizeShard";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import {
  CRYSTALLIZE_EXCESS_SHARD_SECONDS,
  CRYSTALLIZE_SHARD_DROP_SECONDS,
  CRYSTALLIZE_SHARD_LIMIT,
  CRYSTALLIZE_SHARD_SECONDS,
} from "#src/services/combat/shield/constants";
import { getCrystallizeShieldHealth } from "#src/services/combat/shield/getCrystallizeShieldHealth";
import { getEnemyDropPoint } from "#src/services/enemy/getEnemyDropPoint";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

const checkIsKitCrystallizeShard = (effect: KitEffect): effect is KitCrystallizeShard =>
  effect.kind === "crystallizeShard";

// The Crystallize shards the reactions a combatant triggered on an enemy drop, added to the team's effects: each
// Crystallize drops one half a metre out from the enemy's edge at a bearing drawn from the world's random source, holding
// The shield of its element the combatant's level and Elemental Mastery price. Every shard past the newest three goes
// Within two seconds
export const addCrystallizeShards = (
  kitEffectState: KitEffectState,
  { position }: Enemy,
  combatant: Combatant,
  reactions: readonly Reaction[],
  random: () => number,
): void => {
  for (const { element, reactionType } of reactions) {
    if (reactionType !== ReactionType.Crystallize || element === undefined) continue;
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      element,
      health: getCrystallizeShieldHealth(
        combatant.level,
        combatant.attributes.attributeTotalMap[Attribute.ElementalMastery],
      ),
      kind: "crystallizeShard",
      position: getEnemyDropPoint(position, random),
      secondsRemaining: CRYSTALLIZE_SHARD_DROP_SECONDS + CRYSTALLIZE_SHARD_SECONDS,
    });
    for (const shard of kitEffectState.effects
      .filter((effect) => checkIsKitCrystallizeShard(effect))
      .slice(0, -CRYSTALLIZE_SHARD_LIMIT))
      shard.secondsRemaining = Math.min(shard.secondsRemaining, CRYSTALLIZE_EXCESS_SHARD_SECONDS);
  }
};
