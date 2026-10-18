import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { GrowAttribute } from "#src/models/character/GrowAttribute";
import type { WeaponAscensionPhase } from "#src/models/weapon/WeaponAscensionPhase";

import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { growAttributeSchema } from "#src/models/character/GrowAttribute";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { weaponAscensionPhaseSchema } from "#src/models/weapon/WeaponAscensionPhase";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { z } from "zod";

// A weapon of the game's as its tables hold it, by the game's own id: its name by text id, its kind, its rarity in stars,
// Its base ATK and secondary attribute growing with its level, its ascension phases, the EXP it gives as fodder, its
// Passive by its name's text id and each refinement rank's description, numbers and the stats it adds, and what each refinement rank
// Takes: the Mora per rank gained, from the second rank, and the material that may stand for a copy,
// And what destroying it gives back: the game's destroy rule, and the material and how many of it a destroy returns, which
// A weapon whose rule returns materials must name, so no destroy returns a material the table never named
export interface WeaponData {
  ascensionPhases: WeaponAscensionPhase[];
  baseExp: number;
  destroyReturnMaterial: number;
  destroyReturnMaterialCount: number;
  destroyRule: DestroyRule;
  growAttributes: GrowAttribute[];
  id: number;
  nameTextId: string;
  passiveNameTextId: string;
  passiveRankAttributeLines: AttributeLine[][];
  passiveRankDescriptionTextIds: string[];
  passiveRankParams: number[][];
  rarity: number;
  refinementCosts: number[];
  refinementMaterialId: number;
  weaponType: WeaponType;
}

export const weaponDataSchema = z
  .object({
    ascensionPhases: z.array(weaponAscensionPhaseSchema).min(1),
    baseExp: z.int().nonnegative(),
    destroyReturnMaterial: z.int().nonnegative(),
    destroyReturnMaterialCount: z.int().nonnegative(),
    destroyRule: z.enum(DestroyRule),
    growAttributes: z.array(growAttributeSchema),
    id: z.int().positive(),
    nameTextId: z.string().min(1),
    passiveNameTextId: z.string(),
    passiveRankAttributeLines: z.array(z.array(attributeLineSchema)),
    passiveRankDescriptionTextIds: z.array(z.string()),
    passiveRankParams: z.array(z.array(z.number())),
    rarity: z.int().min(1).max(5),
    refinementCosts: z.array(z.int().positive()),
    refinementMaterialId: z.int().nonnegative(),
    weaponType: z.enum(WeaponType),
  })
  .refine(
    ({ passiveRankDescriptionTextIds, passiveRankParams }) =>
      passiveRankDescriptionTextIds.length === passiveRankParams.length,
    "A passive names one description for each rank its numbers read",
  )
  .refine(
    ({ passiveRankAttributeLines, passiveRankParams }) => passiveRankAttributeLines.length === passiveRankParams.length,
    "A passive gives its stats for each rank its numbers read",
  )
  .refine(
    ({ destroyReturnMaterial, destroyReturnMaterialCount, destroyRule }) =>
      destroyRule !== DestroyRule.ReturnMaterial || (destroyReturnMaterial > 0 && destroyReturnMaterialCount > 0),
    "A weapon whose rule returns materials names no return",
  ) satisfies z.ZodType<WeaponData>;
