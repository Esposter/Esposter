import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";

// White Iron Greatsword: the equipped Claymore character deals +1 DMG
export const whiteIronGreatsword: GcgCardModule = createGcgWeaponCard("CLAYMORE");
