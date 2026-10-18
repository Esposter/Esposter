import { z } from "zod";

// The doing an achievement counts, as the game's table names it: its trigger type, and the ids each of its parameter
// Slots names, one list of ids a slot. The reader splits a slot's comma- or semicolon-separated list, one entry an id
export interface AchievementTrigger {
  parameters: string[][];
  type: string;
}

export const achievementTriggerSchema = z.object({
  parameters: z.array(z.array(z.string())),
  type: z.string(),
}) satisfies z.ZodType<AchievementTrigger>;
