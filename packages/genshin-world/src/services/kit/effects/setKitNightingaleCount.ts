import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { HAUNTED_NIGHT_STATUS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Sets a count Haunted Night holds to the one given, for as many seconds as Haunted Night has left, so the count runs out
// With the state rather than on a timer of its own
export const setKitNightingaleCount = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  count: number,
): void => {
  const secondsRemaining = findKitStatus(
    kitEffectState.effects,
    characterId,
    HAUNTED_NIGHT_STATUS_ID,
  )?.secondsRemaining;
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining: secondsRemaining ?? 0, stacks: count });
};
