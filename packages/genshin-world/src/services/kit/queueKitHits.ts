import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitState } from "#src/models/kit/KitState";

import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// The hits of an action that ran its course still to land past the seconds it ran to, queued on the world's clock as
// Gcsim queues each attack at its hitmark whatever its character does next: a summon cast at the body and running on from
// The action's own clock, so each hit lands at its hitmark from where the action was played, priced by the combatant that
// Played it and dealt as its action's kind of attack, through a later action or a swap alike
export const queueKitHits = (
  { hits }: KitAction,
  { actionSeconds, nextHitIndex }: KitState,
  { activeCombatant, body, kitEffectState }: KitContext,
): void => {
  const lastHit = hits.at(-1);
  if (!lastHit || nextHitIndex === hits.length) return;
  castKitSummon(kitEffectState, body, activeCombatant, hits.slice(nextHitIndex), {
    attackTag: lastHit.attackTag,
    elapsedSeconds: actionSeconds,
    secondsRemaining: lastHit.hitmarkSeconds - actionSeconds + SUMMON_LINGER_SECONDS,
  });
};
