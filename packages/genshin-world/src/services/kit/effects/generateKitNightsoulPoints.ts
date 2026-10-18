import type { KitContext } from "#src/models/kit/KitContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { gainKitNightsoulPoints } from "#src/services/kit/effects/gainKitNightsoulPoints";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";

// Generates Nightsoul points for the character on the field up to the maximum, and raises the generation event for the
// Points it added, as gcsim's GeneratePoints does. A hook raises it in its own call, since a step returns its events
export const generateKitNightsoulPoints = (context: KitContext, points: number, maximum: number): void => {
  const { activeCombatant, kitEffectState } = context;
  const { characterId } = activeCombatant;
  const gained = gainKitNightsoulPoints(kitEffectState, characterId, points, maximum);
  if (gained > 0) emitKitEvent({ characterId, kind: KitEventKind.NightsoulPointsGained, points: gained }, context);
};
