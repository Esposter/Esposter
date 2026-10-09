import { wishPitySaveSchema } from "#src/models/wish/WishPitySave";
import { BannerKind } from "genshin-interface/save";
import { z } from "zod";

// Each kind of wish's counters, keyed by the kind, which the save holds whole
export const wishPityMapSaveSchema = z.record(z.enum(BannerKind), wishPitySaveSchema);

export type WishPityMapSave = z.infer<typeof wishPityMapSaveSchema>;
