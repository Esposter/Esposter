import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";

import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";

// The hits of an action that ran its course whose hitmarks fall past the seconds it ran to, queued on the world's clock as
// Gcsim queues each attack at its hitmark whatever its character does next: a summon cast at the body and running on from
// The action's own clock, so each hit lands at its hitmark from where the action was played, priced by the combatant that
// Played it and dealt as its action's kind of attack, through a later action or a swap alike
export const queueKitHits = (
  action: KitAction,
  actionSeconds: number,
  { activeCombatant, body, kitEffectState }: KitContext,
): void => {
  const queuedHits = action.hits.filter(({ hitmarkSeconds }) => hitmarkSeconds > actionSeconds);
  const lastHit = queuedHits.at(-1);
  if (!lastHit) return;
  addKitEffect(kitEffectState, {
    ...createKitSummon(
      body,
      activeCombatant,
      queuedHits,
      lastHit.hitmarkSeconds - actionSeconds + SUMMON_LINGER_SECONDS,
    ),
    attackTag: lastHit.attackTag,
    elapsedSeconds: actionSeconds,
  });
};
