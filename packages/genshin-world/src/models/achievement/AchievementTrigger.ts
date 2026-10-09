import { z } from "zod";

// The doing an achievement counts, as the game's table names it: its trigger type, and the ids its parameters name, one
// Per entry. An OR trigger's comma-separated ids are split by the reader, so each entry is one id
export interface AchievementTrigger {
  parameters: string[];
  type: string;
}

export const achievementTriggerSchema = z.object({
  parameters: z.array(z.string()),
  type: z.string(),
}) satisfies z.ZodType<AchievementTrigger>;
