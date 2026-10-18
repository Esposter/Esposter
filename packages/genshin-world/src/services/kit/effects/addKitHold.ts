import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { ID_SEPARATOR } from "@esposter/shared";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";

// Adds a hold of a passive's id to a character, in the first place of its id that is free. Each hold runs its own seconds, so
// One added later outlives an earlier one that runs out first, and the holds of an id stop at its maximum, adding none past it.
// A hold given Infinity seconds stands until it is released
export const addKitHold = (
  kitEffectState: KitEffectState,
  characterId: number,
  { id, maximum, seconds }: { id: string; maximum: number; seconds: number },
): void => {
  const { effects } = kitEffectState;
  if (countKitHolds(effects, characterId, id) >= maximum) return;
  const place = Array.from({ length: maximum }, (_, index) => `${id}${ID_SEPARATOR}${index}`).find(
    (holdId) => !effects.some((effect) => checkIsKitHold(effect, characterId, id) && effect.id === holdId),
  );
  if (place === undefined) return;
  addKitStatus(kitEffectState, characterId, { id: place, secondsRemaining: seconds });
};
