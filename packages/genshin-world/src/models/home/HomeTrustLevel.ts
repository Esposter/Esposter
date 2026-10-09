import { z } from "zod";

// One Trust Rank: the Trust EXP it takes to pass it, the companions the realm holds at it, and the most Realm Currency and
// Realm Bounty each store holds at it. The last rank has no EXP to pass
export interface HomeTrustLevel {
  bountyStoreLimit: number;
  coinStoreLimit: number;
  exp: number;
  level: number;
  npcCount: number;
}

export const homeTrustLevelSchema = z.object({
  bountyStoreLimit: z.int().nonnegative(),
  coinStoreLimit: z.int().nonnegative(),
  exp: z.int().nonnegative(),
  level: z.int().positive(),
  npcCount: z.int().positive(),
}) satisfies z.ZodType<HomeTrustLevel>;
