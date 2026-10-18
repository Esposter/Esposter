import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropRegion } from "#src/models/leyLine/OutcropRegion";

import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeNextOutcropPlace } from "#src/services/leyLine/computeNextOutcropPlace";

// The outcrop after one event. A touch starts a waiting outcrop's fight, and the last enemy's defeat clears a fight. A
// Claim moves a cleared outcrop to its next place, where it waits, or leaves it claimed in place where none is free. An
// Event that does not apply to the stage the outcrop is in changes nothing
export const advanceOutcrop = (
  region: OutcropRegion,
  outcrop: Outcrop,
  otherKindPlaceId: number | undefined,
  event: OutcropEvent,
): Outcrop => {
  if (event === OutcropEvent.Touched && outcrop.stage === OutcropStage.Waiting)
    return { ...outcrop, stage: OutcropStage.Fighting };
  if (event === OutcropEvent.LastEnemyDefeated && outcrop.stage === OutcropStage.Fighting)
    return { ...outcrop, stage: OutcropStage.Cleared };
  if (event === OutcropEvent.Claimed && outcrop.stage === OutcropStage.Cleared) {
    const nextPlaceId = computeNextOutcropPlace(region, outcrop.placeId, otherKindPlaceId);
    if (nextPlaceId === undefined) return { ...outcrop, stage: OutcropStage.Claimed };
    return { ...outcrop, placeId: nextPlaceId, stage: OutcropStage.Waiting };
  }
  return outcrop;
};
