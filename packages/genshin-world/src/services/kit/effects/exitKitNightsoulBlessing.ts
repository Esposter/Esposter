import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// Exits the Nightsoul's Blessing and drops the points it held, as the wiki holds Nightsoul points only while the blessing
// Lasts. Another character's blessing and points are left as they are
export const exitKitNightsoulBlessing = (kitEffectState: KitEffectState, characterId: number): void => {
  spendKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID);
  removeKitEffects(
    kitEffectState,
    (effect) =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === NIGHTSOUL_BLESSING_STATUS_ID,
  );
};
