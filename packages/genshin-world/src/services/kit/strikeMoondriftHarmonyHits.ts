import type { KitContext } from "#src/models/kit/KitContext";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { strikeLunarReaction } from "#src/services/kit/strikeLunarReaction";
import { runDownSeconds } from "#src/services/runDownSeconds";

// The Moondrift Harmony hits on their way to the enemies some seconds on: each one whose seconds run out lands as a
// Lunar-Crystallize hit from its contributors, owned by the member who resonated it, and the hits on their way to an
// Enemy no longer standing are gone
export const strikeMoondriftHarmonyHits = (stepSeconds: number, context: KitContext): void => {
  for (const enemy of context.enemyMap.values()) {
    if (enemy.moondriftHarmonyHits.length === 0) continue;
    if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state)) {
      enemy.moondriftHarmonyHits = [];
      continue;
    }
    for (const hit of enemy.moondriftHarmonyHits)
      hit.secondsRemaining = runDownSeconds(hit.secondsRemaining, stepSeconds);
    const landedHits = enemy.moondriftHarmonyHits.filter(({ secondsRemaining }) => secondsRemaining <= 0);
    enemy.moondriftHarmonyHits = enemy.moondriftHarmonyHits.filter(({ secondsRemaining }) => secondsRemaining > 0);
    for (const { contributorIds, ownerId } of landedHits)
      strikeLunarReaction(
        enemy,
        LunarReactionType.LunarCrystallize,
        contributorIds,
        context.characterIdCombatantMap.get(ownerId),
        context,
      );
  }
};
