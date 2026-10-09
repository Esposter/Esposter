import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";

// Raven Bow: the equipped Bow character deals +1 DMG
export const ravenBow: GcgCardModule = createGcgWeaponCard("BOW");
