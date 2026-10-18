import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { GameText } from "genshin-text";

import { checkIsForgeDailyCapReached } from "#src/services/forging/checkIsForgeDailyCapReached";
import { ForgeRefusalGameTextKeyMap } from "#src/services/forging/ForgeRefusalGameTextKeyMap";
import { takeOne } from "@esposter/shared";

// The words the blacksmith shows in place of starting an order past the day's forge points: the refusal line of the ore the
// Recipe yields, in the reader's language. An order that fits under the cap shows none
export const computeForgeRefusalLabel = (
  recipe: ForgeRecipe,
  count: number,
  progress: ForgeProgress,
  now: Temporal.Instant,
  gameText: GameText,
): string => {
  if (!checkIsForgeDailyCapReached(recipe, count, progress, now)) return "";
  const { itemId } = takeOne(recipe.results, 0);
  return gameText[takeOne(ForgeRefusalGameTextKeyMap, itemId)];
};
