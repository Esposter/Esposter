import { z } from "zod";

// The Traveler's birthday as the player set it in the profile, its month and day in the game's time zone. The profile
// Sets it once and it cannot be changed after, so the save holds it once it is set and nothing before
export const travelerBirthdaySaveSchema = z.object({ day: z.int().min(1).max(31), month: z.int().min(1).max(12) });

export type TravelerBirthdaySave = z.infer<typeof travelerBirthdaySaveSchema>;
