import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";

import { abyssFloorRewardSchema } from "#src/models/spiralAbyss/AbyssFloorReward";
import { z } from "zod";

// The floors' rewards in every reward group of the game's tower table, the slice the Spiral Abyss writer writes beside the
// Floors, imported on demand and checked against its shape as it arrives
export const readAbyssFloorRewards = async (): Promise<AbyssFloorReward[]> => {
  const { default: rewards } = await import("#src/generated/spiralAbyss/rewards.json");
  return z.array(abyssFloorRewardSchema).parse(rewards);
};
