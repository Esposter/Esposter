import { wishPitySaveSchema } from "#src/models/wish/WishPitySave";
import { EMPTY_WISH_PITY_MAP_SAVE } from "#src/services/save/constants";
import { BannerKind } from "genshin-interface/save";
import { z } from "zod";

// Each kind of wish's counters, keyed by the kind, which the save holds whole
export const wishPityMapSaveSchema = z
  .record(z.enum(BannerKind), wishPitySaveSchema)
  .prefault(EMPTY_WISH_PITY_MAP_SAVE);

export type WishPityMapSave = z.infer<typeof wishPityMapSaveSchema>;
