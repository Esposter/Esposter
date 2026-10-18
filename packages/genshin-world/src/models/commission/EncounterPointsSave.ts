import { MAX_ENCOUNTER_HALF_POINTS } from "#src/services/commission/constants";
import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The Encounter Points as the save holds them: the daily reset they were earned on as an ISO string, and the half points
// Held, at most the storage's
export const encounterPointsSaveSchema = z.object({
  earnedOn: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  halfPoints: z.int().nonnegative().max(MAX_ENCOUNTER_HALF_POINTS),
});

export type EncounterPointsSave = z.infer<typeof encounterPointsSaveSchema>;
