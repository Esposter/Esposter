import { z } from "zod";

// A lift past a level cap with Masterless Stella Fortuna.
// It has the level it lifts from, the level it lifts to, and how many of the item it takes.
export interface MasterlessLevelLift {
  count: number;
  fromLevel: number;
  level: number;
}

export const masterlessLevelLiftSchema = z.object({
  count: z.int().positive(),
  fromLevel: z.int().positive(),
  level: z.int().positive(),
}) satisfies z.ZodType<MasterlessLevelLift>;
