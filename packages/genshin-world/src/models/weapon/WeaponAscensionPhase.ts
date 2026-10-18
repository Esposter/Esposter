import type { AscensionCost } from "#src/models/character/AscensionCost";
import type { AscensionPhase } from "#src/models/character/AscensionPhase";

import { ascensionCostSchema } from "#src/models/character/AscensionCost";
import { ascensionPhaseSchema } from "#src/models/character/AscensionPhase";
import type { z } from "zod";

// An ascension phase of a weapon: its attributes and cap as any phase has them, and what entering it costs
export type WeaponAscensionPhase = AscensionPhase & AscensionCost;

export const weaponAscensionPhaseSchema = ascensionPhaseSchema.extend(
  ascensionCostSchema.shape,
) satisfies z.ZodType<WeaponAscensionPhase>;
