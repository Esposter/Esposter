import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

// Adds a hold of a passive's id to a character, in the first place of its id that is free. Each hold runs its own seconds, so
// One added later outlives an earlier one that runs out first, and the holds of an id stop at its maximum, adding none past it,
// Unless it replaces the one that runs out first, as gcsim's refreshing stack pool does. A hold given Infinity seconds stands
// Until it is released
export const addKitHold = (
  kitEffectState: KitEffectState,
  characterId: number,
  {
    id,
    maximum,
    replacesOldest = false,
    seconds,
  }: { id: string; maximum: number; replacesOldest?: boolean; seconds: number },
): void => {
  const { effects } = kitEffectState;
  if (countKitHolds(effects, characterId, id) >= maximum) {
    if (!replacesOldest) return;
    const holds = effects.filter((effect): effect is KitStatus => checkIsKitHold(effect, characterId, id));
    const oldest = takeOne(
      holds.toSorted((first, second) => first.secondsRemaining - second.secondsRemaining),
      0,
    );
    addKitStatus(kitEffectState, characterId, { id: oldest.id, secondsRemaining: seconds });
    return;
  }
  const place = Array.from({ length: maximum }, (_, index) => `${id}${ID_SEPARATOR}${index}`).find(
    (holdId) => !effects.some((effect) => checkIsKitHold(effect, characterId, id) && effect.id === holdId),
  );
  if (place === undefined) return;
  addKitStatus(kitEffectState, characterId, { id: place, secondsRemaining: seconds });
};
