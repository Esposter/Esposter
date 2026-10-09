import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";

// White Tassel: the equipped Polearm character deals +1 DMG
export const whiteTassel: GcgCardModule = createGcgWeaponCard("POLE");
