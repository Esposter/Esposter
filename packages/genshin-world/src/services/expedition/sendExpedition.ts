import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionContext } from "#src/models/expedition/ExpeditionContext";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsExpeditionPlaceOpen } from "#src/services/expedition/checkIsExpeditionPlaceOpen";
import { EXPEDITION_UNLOCK_RANK } from "#src/services/expedition/constants";

// The expeditions after a character is sent to a place for some of its hours, leaving at `now`. Undefined where the
// Expeditions are not yet open, the character is the Traveler or down, is already away, the limit is reached, or the
// Place is closed or offers no such hours
export const sendExpedition = (
  expeditions: readonly Expedition[],
  characterId: number,
  place: ExpeditionPlace,
  hours: number,
  context: ExpeditionContext,
): Expedition[] | undefined => {
  if (
    context.adventureRank < EXPEDITION_UNLOCK_RANK ||
    characterId === TRAVELER_CHARACTER_ID ||
    context.isCharacterDown ||
    expeditions.some((expedition) => expedition.characterId === characterId) ||
    expeditions.length >= context.expeditionLimit ||
    !place.durations.some((duration) => duration.hours === hours) ||
    !checkIsExpeditionPlaceOpen(place, context)
  )
    return undefined;
  return [...expeditions, { characterId, hours, leftAt: context.now, placeId: place.id }];
};
