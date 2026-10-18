import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { RegionData } from "#src/models/world/RegionData";
import type { GroundPoint } from "genshin-engine";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsGoToReached } from "#src/services/quest/checkIsGoToReached";

// The go-to events a step of the Traveler from one ground point to another raises: one for each go-to place the step
// Carries the Traveler into, and not one it was already within. A place reached is a go-to its quest's objective names
export const getEnteredGoToEvents = (
  regionDatas: readonly RegionData[],
  from: GroundPoint,
  to: GroundPoint,
): QuestEvent[] =>
  regionDatas
    .flatMap(({ goToPlaces }) => goToPlaces)
    .filter((goToPlace) => checkIsGoToReached(goToPlace, to) && !checkIsGoToReached(goToPlace, from))
    .map(({ id }) => ({ kind: QuestObjectiveKind.GoTo, targetId: id }));
