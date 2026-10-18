import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Puts a card on the status list of the character at the target index on the context's side, when there is one, and
// Refreshes the copy already held rather than adding a second
export const addGcgZoneCardToCharacter = (
  { duel, sideIndex }: GcgEffectContext,
  targetIndex: number | undefined,
  cardId: number,
  cardModule: GcgCardModule,
): void => {
  const side = takeOne(duel.sides, sideIndex);
  const character = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
  if (character) placeGcgZoneCard(character.statuses, cardId, cardModule);
};
