import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import type { Element } from "#src/models/Element";
import { applyGcgApplication } from "#src/services/gcg/effects/applyGcgApplication";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// A skill that applies its element to its side's active character and places its onstage card once its damage is dealt
export const createGcgApplicationOnstageAfterDamage =
  (element: Element, cardId: number, onstageCard: GcgCardModule): NonNullable<GcgSkillModule["afterDamage"]> =>
  ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) applyGcgApplication(duel, sideIndex, user, element);
    placeGcgZoneCard(side.onstages, cardId, onstageCard);
  };
