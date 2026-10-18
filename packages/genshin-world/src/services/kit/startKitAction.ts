import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitState } from "#src/models/kit/KitState";

import { landKitHits } from "#src/services/kit/landKitHits";

// An action begun in place at the start of its seconds, or past the given seconds of its charge when a charge skip stands,
// Its queued press spent and the hits its start reaches landed
export const startKitAction = (
  kitState: KitState,
  action: KitAction,
  landedHits: KitHit[],
  context: KitContext,
  startSeconds = 0,
): KitAction => {
  kitState.action = action;
  kitState.actionLengthSeconds = action.seconds;
  kitState.actionSeconds = startSeconds;
  kitState.isAttackQueued = false;
  kitState.nextHitIndex = landKitHits(action.hits, 0, startSeconds, landedHits, context);
  return action;
};
