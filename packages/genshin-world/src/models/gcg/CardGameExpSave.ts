import { z } from "zod";

// The card game's Player EXP a player has earned, which the card game's Player Level is read from
export const cardGameExpSaveSchema = z.int().nonnegative();

export type CardGameExpSave = z.infer<typeof cardGameExpSaveSchema>;
