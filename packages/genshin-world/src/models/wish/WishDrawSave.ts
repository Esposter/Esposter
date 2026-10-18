import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { BannerKind } from "genshin-interface/save";
import { z } from "zod";

// One draw the wish history keeps: the kind of banner it was drawn on, the game's id of the item it drew and the instant
// It was drawn at, as the save writes an instant
export const wishDrawSaveSchema = z.object({
  bannerKind: z.enum(BannerKind),
  itemId: z.int().positive(),
  time: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
});

export type WishDrawSave = z.infer<typeof wishDrawSaveSchema>;
