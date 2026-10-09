import { z } from "zod";

// The Adventure EXP a player has earned, which the rank and the World Level are read from
export const adventureExpSaveSchema = z.int().nonnegative();

export type AdventureExpSave = z.infer<typeof adventureExpSaveSchema>;
