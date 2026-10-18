import type { KitAction } from "#src/models/kit/KitAction";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";

import { applyKitHitBehaviour } from "#src/services/kit/build/applyKitHitBehaviour";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A built action given what its behaviour sets going as it starts and each of its hits' behaviour, in place, every hit
// Checked complete whether its behaviour names it or not. It fails where the behaviour names more hits than it holds
export const applyKitActionBehaviour = (
  action: KitAction,
  behaviour: KitActionBehaviour | undefined,
  path: string,
): KitAction => {
  const { decideLength, hits = [], onStart } = behaviour ?? {};
  if (decideLength) action.decideLength = decideLength;
  if (hits.length > action.hits.length)
    throw new InvalidOperationError(Operation.Update, path, `its record holds ${action.hits.length} hits`);
  if (onStart) action.onStart = onStart;
  for (const [index, hit] of action.hits.entries())
    applyKitHitBehaviour(hit, hits[index] ?? {}, `${path}.hits.${index}`);
  return action;
};
