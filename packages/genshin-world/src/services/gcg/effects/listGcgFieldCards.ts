import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// The cards a side has on the field, in the order the phases act on them: its characters' equipments and statuses (only
// The one at characterIndex when given, else every character's), then its supports, summons and onstage cards
export const listGcgFieldCards = (side: GcgSideState, characterIndex: number | undefined): GcgZoneCard[] => {
  const characterCards: GcgZoneCard[] = [];
  for (const [index, character] of side.characters.entries())
    if (characterIndex === undefined || index === characterIndex)
      characterCards.push(...character.equipments, ...character.statuses);
  return [...characterCards, ...side.supports, ...side.summons, ...side.onstages];
};
