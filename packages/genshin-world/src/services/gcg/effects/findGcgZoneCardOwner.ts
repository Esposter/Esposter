import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// The index of the character a card is attached to, as an equipment or a status, or undefined for a card on the field that
// No character holds
export const findGcgZoneCardOwner = (characters: GcgCharacterState[], zoneCard: GcgZoneCard): number | undefined => {
  const ownerIndex = characters.findIndex(
    (character) => character.equipments.includes(zoneCard) || character.statuses.includes(zoneCard),
  );
  return ownerIndex === -1 ? undefined : ownerIndex;
};
