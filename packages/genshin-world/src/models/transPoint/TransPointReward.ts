import { z } from "zod";

// What a transport point's first unlock pays, from the open world's transport point table: its Adventure EXP and Primogems,
// Keyed by the point's id, which the statues and the waypoints name in the open world's scene
export interface TransPointReward {
  adventureExp: number;
  pointId: number;
  primogems: number;
}

export const transPointRewardSchema = z.object({
  adventureExp: z.int().nonnegative(),
  pointId: z.int().nonnegative(),
  primogems: z.int().nonnegative(),
}) satisfies z.ZodType<TransPointReward>;
