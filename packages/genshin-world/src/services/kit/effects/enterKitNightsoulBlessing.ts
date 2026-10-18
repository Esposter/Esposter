import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// Enters the Nightsoul's Blessing for the seconds given, with the points it starts with in place of any it held, as gcsim
// (MIT) nightsoul/nightsoul.go EnterTimedBlessing sets them outright, uncapped. Entering again restarts the blessing
export const enterKitNightsoulBlessing = (
  kitEffectState: KitEffectState,
  characterId: number,
  points: number,
  secondsRemaining: number,
): void => {
  spendKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID);
  gainKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID, points, Number.POSITIVE_INFINITY);
  addKitStatus(kitEffectState, characterId, { id: NIGHTSOUL_BLESSING_STATUS_ID, secondsRemaining });
};
