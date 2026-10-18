import type { AscensionCost } from "#src/models/character/AscensionCost";
import type { AscensionPhase } from "#src/models/character/AscensionPhase";

import { ascensionCostSchema } from "#src/models/character/AscensionCost";
import { ascensionPhaseSchema } from "#src/models/character/AscensionPhase";
import type { z } from "zod";

// An ascension phase of a character: its attributes and cap as any phase has them, and what entering it costs. A table
// Published before the costs were carries none, so an absent cost refuses the ascension rather than making it free
export type CharacterAscensionPhase = AscensionPhase & Partial<AscensionCost>;

export const characterAscensionPhaseSchema = ascensionPhaseSchema.extend(
  ascensionCostSchema.partial().shape,
) satisfies z.ZodType<CharacterAscensionPhase>;
