import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitState } from "#src/models/kit/KitState";

import { landKitHits } from "#src/services/kit/landKitHits";

// An action begun in place at the start of its seconds, its queued press spent and the hits at its start landed
export const startKitAction = (kitState: KitState, action: KitAction, landedHits: KitHit[]): KitAction => {
  kitState.action = action;
  kitState.actionSeconds = 0;
  kitState.isAttackQueued = false;
  landKitHits(action, -Infinity, 0, landedHits);
  return action;
};
