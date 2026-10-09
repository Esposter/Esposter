import { EMPTY_ADVENTURE_EXP_SAVE } from "#src/services/save/constants";
import { z } from "zod";

// The Adventure EXP a player has earned, which the rank and the World Level are read from
export const adventureExpSaveSchema = z.int().nonnegative().prefault(EMPTY_ADVENTURE_EXP_SAVE);

export type AdventureExpSave = z.infer<typeof adventureExpSaveSchema>;
