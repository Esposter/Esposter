import { z } from "zod";

// A fish as the generated fish slice holds it: its hit points, the ranges its lure reactions are drawn at, its bite's
// Timeout in seconds, the feeler range its nibbles run over, the moving zone its tension is held in while reeled, the
// Item it becomes in the bag, the proficiency it counts toward, its catch's reward row and the skills it fights with
export interface Fish {
  attractRange: number;
  biteTimeout: number;
  bonusDuration: number[];
  bonusOffset: number[];
  bonusSpeed: number[];
  bonusWidth: number;
  feelerTimes: number[];
  fleeRange: number;
  hp: number;
  id: number;
  itemId: number;
  proficientId: number;
  rewardId: number;
  skillId: number[];
}

export const fishSchema = z.object({
  attractRange: z.number().nonnegative(),
  biteTimeout: z.number().nonnegative(),
  bonusDuration: z.array(z.number().nonnegative()),
  bonusOffset: z.array(z.number()),
  bonusSpeed: z.array(z.number()),
  bonusWidth: z.number().nonnegative(),
  feelerTimes: z.array(z.number().nonnegative()),
  fleeRange: z.number().nonnegative(),
  hp: z.int().positive(),
  id: z.int().positive(),
  itemId: z.int().positive(),
  proficientId: z.int().positive(),
  rewardId: z.int().positive(),
  skillId: z.array(z.int().positive()),
}) satisfies z.ZodType<Fish>;
