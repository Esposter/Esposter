import type { KitEffectExpiredEvent } from "#src/models/kit/KitEffectExpiredEvent";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitNightsoulPointsConsumedEvent } from "#src/models/kit/KitNightsoulPointsConsumedEvent";
import type { KitNightsoulPointsGainedEvent } from "#src/models/kit/KitNightsoulPointsGainedEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { gainKitNightsoulPoints } from "#src/services/kit/effects/gainKitNightsoulPoints";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// The events a step raises for the points a blessing gains or drains, and for a blessing its points run out of
type NightsoulStepEvent = KitEffectExpiredEvent | KitNightsoulPointsConsumedEvent | KitNightsoulPointsGainedEvent;

// The points each blessing gains or drains over a step, a blessing that drains to none ending with it, and then the points
// A character holds with no blessing left, which a blessing that ran out on the step took with it. Each walk reads the
// List it starts with, and the step runs this after its own walks, so its writes land on the list they left. The points a
// Blessing drains or gains are the places points are consumed or generated, so the step returns them as events for its caller to raise
export const stepKitNightsoul = (stepSeconds: number, kitEffectState: KitEffectState): NightsoulStepEvent[] => {
  const events: NightsoulStepEvent[] = [];
  for (const effect of kitEffectState.effects) {
    if (effect.kind !== "status" || effect.id !== NIGHTSOUL_BLESSING_STATUS_ID || !effect.nightsoulRate) continue;
    const { characterId, nightsoulRate } = effect;
    if (nightsoulRate.perSecond > 0) {
      const points = gainKitNightsoulPoints(
        kitEffectState,
        characterId,
        nightsoulRate.perSecond * stepSeconds,
        nightsoulRate.maximum,
      );
      if (points > 0) events.push({ characterId, kind: KitEventKind.NightsoulPointsGained, points });
    } else if (nightsoulRate.perSecond < 0) {
      const points = drainKitNightsoulPoints(kitEffectState, characterId, -nightsoulRate.perSecond * stepSeconds);
      if (points > 0) events.push({ characterId, kind: KitEventKind.NightsoulPointsConsumed, points });
      // The blessing's exit is sent as its expiry, as a blessing that runs out of seconds is, so each kit hears it end
      if (countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) === 0) {
        exitKitNightsoulBlessing(kitEffectState, characterId);
        events.push({ effect, kind: KitEventKind.EffectExpired });
      }
    }
  }
  for (const effect of kitEffectState.effects)
    if (
      effect.kind === "status" &&
      effect.id === NIGHTSOUL_POINTS_ID &&
      !findKitStatus(kitEffectState.effects, effect.characterId, NIGHTSOUL_BLESSING_STATUS_ID)
    )
      spendKitResource(kitEffectState, effect.characterId, NIGHTSOUL_POINTS_ID);
  return events;
};
