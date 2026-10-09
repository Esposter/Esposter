import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";

// Traveler's Handy Sword: the equipped Sword character deals +1 DMG
export const travelersHandySword: GcgCardModule = createGcgWeaponCard("SWORD");
