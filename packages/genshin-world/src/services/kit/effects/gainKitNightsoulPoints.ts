import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";

// Gains an amount of Nightsoul points up to the maximum and returns the points it added, none once a character's points
// Are full, as gcsim (MIT) nightsoul/nightsoul.go GeneratePoints clamps them and reports what it added. The caller raises
// The generation event, since a step returns its events and a hook sends them as it runs
export const gainKitNightsoulPoints = (
  kitEffectState: KitEffectState,
  characterId: number,
  amount: number,
  maximum: number,
): number => {
  const held = countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID);
  return Math.max(0, gainKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID, amount, maximum) - held);
};
