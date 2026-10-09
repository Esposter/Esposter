import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";

// Magic Guide: the equipped Catalyst character deals +1 DMG
export const magicGuide: GcgCardModule = createGcgWeaponCard("CATALYST");
