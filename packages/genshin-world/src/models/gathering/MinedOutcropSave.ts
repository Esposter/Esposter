import { MAX_SAVE_ID_LENGTH, MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A mined outcrop as the save holds it: its place's id, and the instant it was mined as an ISO instant on the server's clock
export const minedOutcropSaveSchema = z.object({
  id: z.string().min(1).max(MAX_SAVE_ID_LENGTH),
  minedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
});

export type MinedOutcropSave = z.infer<typeof minedOutcropSaveSchema>;
