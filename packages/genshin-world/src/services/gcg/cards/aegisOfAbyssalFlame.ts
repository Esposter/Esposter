import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { addGcgShield } from "#src/services/gcg/effects/addGcgShield";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";

export const AEGIS_OF_ABYSSAL_FLAME_ID = 123_024;
const AEGIS_SHIELD_POINTS = 2;
const AEGIS_PIERCING_DAMAGE = 1;

// Aegis of Abyssal Flame, a state its character gains: 2 shield points, and once they are depleted, 1 piercing DMG to every
// Opposing character (the wiki's Aegis of Abyssal Flame). The state is then spent
export const aegisOfAbyssalFlame: GcgCardModule = {
  initialUsages: 1,
  onShieldDepleted: (_context, zoneCard) => {
    zoneCard.usages = 0;
    return AEGIS_PIERCING_DAMAGE;
  },
};

// Gives a character the Aegis of Abyssal Flame: its shield points, up to the shield limit, and the state
export const attachGcgAegisOfAbyssalFlame = (character: GcgCharacterState): void => {
  addGcgShield(character, AEGIS_SHIELD_POINTS);
  placeGcgZoneCard(character.statuses, AEGIS_OF_ABYSSAL_FLAME_ID, aegisOfAbyssalFlame);
};
