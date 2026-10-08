import type { AscensionPhase } from "#src/models/character/AscensionPhase";
import type { GrowAttribute } from "#src/models/character/GrowAttribute";

import { ascensionPhaseSchema } from "#src/models/character/AscensionPhase";
import { growAttributeSchema } from "#src/models/character/GrowAttribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { z } from "zod";

// A weapon of the game's as its tables hold it, by the game's own id: its kind, its rarity in stars, its base ATK and
// Secondary attribute growing with its level, and its ascension phases
export interface WeaponData {
  ascensionPhases: AscensionPhase[];
  growAttributes: GrowAttribute[];
  id: number;
  rarity: number;
  weaponType: WeaponType;
}

export const weaponDataSchema = z.object({
  ascensionPhases: z.array(ascensionPhaseSchema).min(1),
  growAttributes: z.array(growAttributeSchema),
  id: z.int().positive(),
  rarity: z.int().min(1).max(5),
  weaponType: z.enum(WeaponType),
}) satisfies z.ZodType<WeaponData>;
