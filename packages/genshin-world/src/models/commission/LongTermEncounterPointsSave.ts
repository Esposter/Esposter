import { z } from "zod";

// The Long-Term Encounter Points as the save holds them: the half points held and the major version they were earned
// In, Each as a whole number
export const longTermEncounterPointsSaveSchema = z.object({
  halfPoints: z.int().nonnegative(),
  majorVersion: z.int().nonnegative(),
});

export type LongTermEncounterPointsSave = z.infer<typeof longTermEncounterPointsSaveSchema>;
