import type { AscensionCost } from "#src/models/character/AscensionCost";
import type { AscensionPhase } from "#src/models/character/AscensionPhase";
import type { z } from "zod";

import { ascensionCostSchema } from "#src/models/character/AscensionCost";
import { ascensionPhaseSchema } from "#src/models/character/AscensionPhase";

// An ascension phase of a weapon: its attributes and cap as any phase has them, and what entering it costs
export type WeaponAscensionPhase = AscensionCost & AscensionPhase;

export const weaponAscensionPhaseSchema = ascensionPhaseSchema.extend(
  ascensionCostSchema.shape,
) satisfies z.ZodType<WeaponAscensionPhase>;
