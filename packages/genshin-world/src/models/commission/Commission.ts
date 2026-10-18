import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { z } from "zod";

// One daily task of the game's table: where it is set, the radius it begins and ends in, what finishes it and how far, the
// Groups a scene task swaps, the quest a quest task is, the reward tier it pays from, the region it is preferred in and the
// Text id of its title
export interface Commission {
  // A quest task the dump gives no place has the empty one
  centerPosition: string;
  enterDistance: number;
  exitDistance: number;
  finishKind: CommissionFinishKind;
  finishProgress: number;
  id: number;
  kind: CommissionKind;
  newGroupIds: number[];
  oldGroupIds: number[];
  poolId: number;
  preferredRegion: string;
  questId: string;
  rewardTier: number;
  titleTextId: number;
}

export const commissionSchema = z.object({
  centerPosition: z.string(),
  enterDistance: z.int().nonnegative(),
  exitDistance: z.int().nonnegative(),
  finishKind: z.enum(CommissionFinishKind),
  finishProgress: z.int().nonnegative(),
  id: z.int().positive(),
  kind: z.enum(CommissionKind),
  newGroupIds: z.array(z.int().positive()),
  oldGroupIds: z.array(z.int().positive()),
  poolId: z.int().positive(),
  preferredRegion: z.string().nonempty(),
  questId: z.string(),
  rewardTier: z.int().positive(),
  titleTextId: z.int().nonnegative(),
}) satisfies z.ZodType<Commission>;
