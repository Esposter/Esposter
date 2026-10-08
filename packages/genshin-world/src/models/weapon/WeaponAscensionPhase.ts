import type { AscensionPhase } from "#src/models/character/AscensionPhase";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { ascensionPhaseSchema } from "#src/models/character/AscensionPhase";
import { itemCountSchema } from "#src/models/inventory/ItemCount";
import { z } from "zod";

// An ascension phase of a weapon: its attributes and cap as any phase has them, and what entering it costs, the Mora,
// The items and the Adventure Rank the player needs
export interface WeaponAscensionPhase extends AscensionPhase {
  coinCost: number;
  costItems: ItemCount[];
  requiredPlayerLevel: number;
}

export const weaponAscensionPhaseSchema = ascensionPhaseSchema.extend({
  coinCost: z.int().nonnegative(),
  costItems: z.array(itemCountSchema),
  requiredPlayerLevel: z.int().nonnegative(),
}) satisfies z.ZodType<WeaponAscensionPhase>;
