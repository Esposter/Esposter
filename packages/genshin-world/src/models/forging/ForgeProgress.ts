import type { ForgeOrder } from "#src/models/forging/ForgeOrder";

// The forging a player has done at the blacksmith: the ids of the recipes they have learned from their diagrams, the orders
// Each queue holds, in the order they were started, and the forge points forged on the game day `forgedPointsDay`
export interface ForgeProgress {
  forgedPoints: number;
  forgedPointsDay: Temporal.PlainDate;
  learnedRecipeIds: number[];
  orders: ForgeOrder[];
}
