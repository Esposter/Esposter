import { z } from "zod";

// One Artifact Strongbox the Mystic Offering makes, by the artifact set it holds: the set's id, the text id of its display
// Name ("Artifact Strongbox: <set>"), how many artifacts an offering gives up for one and their star rank, and the set's
// Pieces it can hold by item id, one of which it rolls at random
export interface CraftingStrongbox {
  id: number;
  nameTextId: string;
  needCount: number;
  pieceItemIds: number[];
  rarity: number;
}

export const craftingStrongboxSchema = z.object({
  id: z.int().positive(),
  nameTextId: z.string().min(1),
  needCount: z.int().positive(),
  pieceItemIds: z.array(z.int().positive()).min(1),
  rarity: z.int().positive(),
}) satisfies z.ZodType<CraftingStrongbox>;
