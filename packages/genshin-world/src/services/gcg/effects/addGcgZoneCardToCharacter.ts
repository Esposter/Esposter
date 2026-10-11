import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Puts a card on the status list of the character at the target index on the context's side, when there is one
export const addGcgZoneCardToCharacter = (
  { duel, sideIndex }: GcgEffectContext,
  targetIndex: number | undefined,
  cardId: number,
  cardModule: GcgCardModule,
): void => {
  const side = takeOne(duel.sides, sideIndex);
  const character = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
  character?.statuses.push(createGcgZoneCard(cardId, cardModule));
};
