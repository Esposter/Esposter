import { z } from "zod";

// An offering's progress as the save holds it: the items held toward its next level and the level it has reached. Its
// Levels are the game's own and are read from the hosted game data, so the save holds only what the player offered
export const offeringProgressSaveSchema = z.object({ heldCount: z.int().nonnegative(), level: z.int().nonnegative() });

export type OfferingProgressSave = z.infer<typeof offeringProgressSaveSchema>;
