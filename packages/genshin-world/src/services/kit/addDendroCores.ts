import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDendroCore } from "#src/models/kit/KitDendroCore";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import {
  DENDRO_CORE_DROP_SECONDS,
  DENDRO_CORE_LIFETIME_SECONDS,
  MAX_DENDRO_CORE_COUNT,
} from "#src/services/combat/dendroCore/constants";
import { getEnemyDropPoint } from "#src/services/enemy/getEnemyDropPoint";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";

const checkIsBloomCore = (effect: KitEffect): effect is KitDendroCore =>
  effect.kind === "dendroCore" && effect.reactionType === TransformativeReactionType.Bloom;

// The Dendro Cores the Blooms a combatant triggered on an enemy leave, added to the team's effects: each drops out from
// The enemy's edge, stands half a second on and bursts as Bloom six seconds after that, priced from the combatant. A
// Lunar-Bloom leaves the same core, whose burst is a Bloom's and no Lunar damage. Every core past the newest five bursts
// As the newest stands
export const addDendroCores = (
  kitEffectState: KitEffectState,
  { position }: Enemy,
  { characterId }: Combatant,
  reactions: readonly Reaction[],
  random: () => number,
): void => {
  for (const { reactionType } of reactions) {
    if (reactionType !== ReactionType.Bloom && reactionType !== ReactionType.LunarBloom) continue;
    addKitEffect(kitEffectState, {
      characterId,
      kind: "dendroCore",
      position: getEnemyDropPoint(position, random),
      reactionType: TransformativeReactionType.Bloom,
      secondsRemaining: DENDRO_CORE_DROP_SECONDS + DENDRO_CORE_LIFETIME_SECONDS,
    });
    for (const core of kitEffectState.effects
      .filter((effect) => checkIsBloomCore(effect))
      .slice(0, -MAX_DENDRO_CORE_COUNT))
      core.secondsRemaining = Math.min(core.secondsRemaining, DENDRO_CORE_DROP_SECONDS);
  }
};
