import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { z } from "zod";

// One daily task of the game's table: where it is set, the radius it begins and ends in, what finishes it and how far, the
// Groups a scene task swaps, the quest a quest task is, and the reward tier it pays from
export interface Commission {
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
  questId: string;
  rewardTier: number;
}

export const commissionSchema = z.object({
  centerPosition: z.string().nonempty(),
  enterDistance: z.int().nonnegative(),
  exitDistance: z.int().nonnegative(),
  finishKind: z.enum(CommissionFinishKind),
  finishProgress: z.int().nonnegative(),
  id: z.int().positive(),
  kind: z.enum(CommissionKind),
  newGroupIds: z.array(z.int().positive()),
  oldGroupIds: z.array(z.int().positive()),
  poolId: z.int().positive(),
  questId: z.string(),
  rewardTier: z.int().positive(),
}) satisfies z.ZodType<Commission>;
