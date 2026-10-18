import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitNightsoulPointsConsumedEvent } from "#src/models/kit/KitNightsoulPointsConsumedEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// The points each blessing gains or drains over a step, a blessing that drains to none ending with it, and then the points
// A character holds with no blessing left, which a blessing that ran out on the step took with it. Each walk reads the
// List it starts with, and the step runs this after its own walks, so its writes land on the list they left. The points a
// Blessing drains are the one place points are consumed, so the step returns them as events for its caller to raise
export const stepKitNightsoul = (
  stepSeconds: number,
  kitEffectState: KitEffectState,
): KitNightsoulPointsConsumedEvent[] => {
  const consumedEvents: KitNightsoulPointsConsumedEvent[] = [];
  for (const effect of kitEffectState.effects) {
    if (effect.kind !== "status" || effect.id !== NIGHTSOUL_BLESSING_STATUS_ID || !effect.nightsoulRate) continue;
    const { characterId, nightsoulRate } = effect;
    if (nightsoulRate.perSecond > 0)
      gainKitResource(
        kitEffectState,
        characterId,
        NIGHTSOUL_POINTS_ID,
        nightsoulRate.perSecond * stepSeconds,
        nightsoulRate.maximum,
      );
    else if (nightsoulRate.perSecond < 0) {
      const points = drainKitNightsoulPoints(kitEffectState, characterId, -nightsoulRate.perSecond * stepSeconds);
      if (points > 0) consumedEvents.push({ characterId, kind: KitEventKind.NightsoulPointsConsumed, points });
      if (countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) === 0)
        exitKitNightsoulBlessing(kitEffectState, characterId);
    }
  }
  for (const effect of kitEffectState.effects)
    if (
      effect.kind === "status" &&
      effect.id === NIGHTSOUL_POINTS_ID &&
      !findKitStatus(kitEffectState.effects, effect.characterId, NIGHTSOUL_BLESSING_STATUS_ID)
    )
      spendKitResource(kitEffectState, effect.characterId, NIGHTSOUL_POINTS_ID);
  return consumedEvents;
};
