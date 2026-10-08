import type { GrowAttribute } from "#src/models/character/GrowAttribute";
import type { WeaponAscensionPhase } from "#src/models/weapon/WeaponAscensionPhase";

import { growAttributeSchema } from "#src/models/character/GrowAttribute";
import { weaponAscensionPhaseSchema } from "#src/models/weapon/WeaponAscensionPhase";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { z } from "zod";

// A weapon of the game's as its tables hold it, by the game's own id: its name by text id, its kind, its rarity in stars,
// Its base ATK and secondary attribute growing with its level, its ascension phases, the EXP it gives as fodder, and what
// Each refinement rank takes: the Mora per rank gained, from the second rank, and the material that may stand for a copy
export interface WeaponData {
  ascensionPhases: WeaponAscensionPhase[];
  baseExp: number;
  growAttributes: GrowAttribute[];
  id: number;
  nameTextId: string;
  rarity: number;
  refinementCosts: number[];
  refinementMaterialId: number;
  weaponType: WeaponType;
}

export const weaponDataSchema = z.object({
  ascensionPhases: z.array(weaponAscensionPhaseSchema).min(1),
  baseExp: z.int().nonnegative(),
  growAttributes: z.array(growAttributeSchema),
  id: z.int().positive(),
  nameTextId: z.string().min(1),
  rarity: z.int().min(1).max(5),
  refinementCosts: z.array(z.int().positive()),
  refinementMaterialId: z.int().nonnegative(),
  weaponType: z.enum(WeaponType),
}) satisfies z.ZodType<WeaponData>;
