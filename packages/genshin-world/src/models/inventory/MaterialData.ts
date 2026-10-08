import { MaterialType } from "#src/models/inventory/MaterialType";
import { GameTextKey } from "genshin-text";
import { z } from "zod";

// A row of the world's materials table, as `genshin:assets items` writes it: an item's id and type, the key of its name
// In the game text, its rank in its tab, its rarity in stars and how many of it one stack holds
export interface MaterialData {
  id: number;
  materialType: MaterialType;
  nameTextId: GameTextKey;
  rank: number;
  rarity: number;
  stackLimit: number;
}

export const materialDataSchema = z.object({
  id: z.int().positive(),
  materialType: z.enum(MaterialType) satisfies z.ZodType<MaterialType>,
  nameTextId: z.enum(GameTextKey) satisfies z.ZodType<GameTextKey>,
  rank: z.int().nonnegative(),
  rarity: z.int().positive(),
  stackLimit: z.int().positive(),
}) satisfies z.ZodType<MaterialData>;
