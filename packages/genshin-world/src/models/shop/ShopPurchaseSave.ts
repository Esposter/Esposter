import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A good's purchases as the save holds them: how many were bought in the latest one's refresh window, and the moment of
// The latest as its ISO string, which is read back into the purchase's Temporal instant when the save loads
export const shopPurchaseSaveSchema = z.object({
  count: z.int().positive(),
  goodsId: z.int().positive(),
  lastPurchasedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
});

export type ShopPurchaseSave = z.infer<typeof shopPurchaseSaveSchema>;
