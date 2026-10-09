import { z } from "zod";

// A character's namecard as the world reads it: the character it belongs to, the item the namecard is, and the text id of
// That item's name
export interface FriendshipNamecard {
  characterId: number;
  itemId: number;
  nameTextId: number;
}

export const friendshipNamecardSchema = z.object({
  characterId: z.int().positive(),
  itemId: z.int().positive(),
  nameTextId: z.int().positive(),
}) satisfies z.ZodType<FriendshipNamecard>;
