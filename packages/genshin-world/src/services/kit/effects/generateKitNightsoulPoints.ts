import type { KitContext } from "#src/models/kit/KitContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { gainKitNightsoulPoints } from "#src/services/kit/effects/gainKitNightsoulPoints";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";

// Generates Nightsoul points for the character on the field, or for the one given, up to the maximum, and raises the
// Generation event for the points it added, as gcsim's GeneratePoints does. A hook raises it in its own call, since a
// Step returns its events
export const generateKitNightsoulPoints = (
  context: KitContext,
  points: number,
  maximum: number,
  characterId = context.activeCombatant.characterId,
): number => {
  const { kitEffectState } = context;
  const gained = gainKitNightsoulPoints(kitEffectState, characterId, points, maximum);
  if (gained > 0) emitKitEvent({ characterId, kind: KitEventKind.NightsoulPointsGained, points: gained }, context);
  return gained;
};
