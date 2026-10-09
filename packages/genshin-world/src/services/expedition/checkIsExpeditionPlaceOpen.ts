import type { ExpeditionContext } from "#src/models/expedition/ExpeditionContext";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

// Whether a place is open to an expedition under this context: the Adventure Rank it opens at reached, its statue
// Resonated with where it names one, and its quest finished where it names one
export const checkIsExpeditionPlaceOpen = (
  place: ExpeditionPlace,
  {
    adventureRank,
    completedQuestIds,
    unlockedStatuePointIds,
  }: Pick<ExpeditionContext, "adventureRank" | "completedQuestIds" | "unlockedStatuePointIds">,
): boolean =>
  adventureRank >= place.rankLevel &&
  (place.statuePointId === 0 || unlockedStatuePointIds.has(place.statuePointId)) &&
  (place.questId === "" || completedQuestIds.has(place.questId));
