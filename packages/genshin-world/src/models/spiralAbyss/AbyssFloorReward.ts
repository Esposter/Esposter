import { ABYSS_FLOOR_CHAMBER_COUNT } from "#src/services/spiralAbyss/constants";
import { z } from "zod";

// The rewards a floor gives in one reward group of the game's tower table: the first clear of each of its chambers, in
// Order, and the one each of its three star milestones gives. A period of the Moon Spire names the group it draws from
export interface AbyssFloorReward {
  chamberRewardIds: number[];
  floorIndex: number;
  nineStarRewardId: number;
  rewardGroup: number;
  sixStarRewardId: number;
  threeStarRewardId: number;
}

export const abyssFloorRewardSchema = z.object({
  chamberRewardIds: z.array(z.int().positive()).length(ABYSS_FLOOR_CHAMBER_COUNT),
  floorIndex: z.int().positive(),
  nineStarRewardId: z.int().positive(),
  rewardGroup: z.int().positive(),
  sixStarRewardId: z.int().positive(),
  threeStarRewardId: z.int().positive(),
}) satisfies z.ZodType<AbyssFloorReward>;
