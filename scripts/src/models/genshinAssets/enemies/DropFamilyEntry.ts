import { matSetSchema } from "#src/models/genshinAssets/enemies/MatSet";
import { z } from "zod";

// One family's entry in the drops module's Enemies table: its members, which the Drops Tables name, its material sets and its Mora
export const dropFamilyEntrySchema = z.object({
  MatSet1: matSetSchema.optional(),
  MatSet2: matSetSchema.optional(),
  members: z.array(z.string()),
  mora: z.number().nonnegative(),
});
export type DropFamilyEntry = z.infer<typeof dropFamilyEntrySchema>;
