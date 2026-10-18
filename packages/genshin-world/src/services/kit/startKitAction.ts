import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitState } from "#src/models/kit/KitState";

import { landKitHits } from "#src/services/kit/landKitHits";

// An action begun in place at the start of its seconds, or past the given seconds of its charge when a charge skip stands,
// Its queued press spent and the hits its start reaches landed. A press that ends a state plays none of the action's
// Hits, so it starts hitless, with no hit landed now or still to land
export const startKitAction = (
  kitState: KitState,
  action: KitAction,
  landedHits: KitHit[],
  context: KitContext,
  { isHitless = false, startSeconds = 0 }: { isHitless?: boolean; startSeconds?: number } = {},
): KitAction => {
  kitState.action = action;
  kitState.actionLengthSeconds = action.seconds;
  kitState.actionSeconds = startSeconds;
  kitState.isAttackQueued = false;
  kitState.nextHitIndex = isHitless
    ? action.hits.length
    : landKitHits(action.hits, 0, startSeconds, landedHits, context);
  return action;
};
