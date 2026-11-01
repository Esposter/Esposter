import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { z } from "zod";

// A row of the world's materials table, as `genshin:assets items` writes it: an item's id and type, the text id of its
// Name, its rank in its tab, its rarity in stars (zero where the game's table gives it none), how many of it one stack
// Holds, and the game's destroy rule for it where its row gives one. Its name is read by that text id from the names a
// Caller holds, the game text or a name-text chunk
export interface MaterialData {
  destroyRule?: DestroyRule;
  id: number;
  materialType: MaterialType;
  nameTextId: string;
  rank: number;
  rarity: number;
  stackLimit: number;
}

export const materialDataSchema = z.object({
  destroyRule: z.enum(DestroyRule).optional(),
  id: z.int().positive(),
  materialType: z.enum(MaterialType) satisfies z.ZodType<MaterialType>,
  nameTextId: z.string().min(1),
  rank: z.int().nonnegative(),
  rarity: z.int().nonnegative(),
  stackLimit: z.int().positive(),
}) satisfies z.ZodType<MaterialData>;
