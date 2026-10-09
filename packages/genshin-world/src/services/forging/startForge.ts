import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsForgeDailyCapReached } from "#src/services/forging/checkIsForgeDailyCapReached";
import { checkIsForgeRecipeOpen } from "#src/services/forging/checkIsForgeRecipeOpen";
import { computeForgeQueueCount } from "#src/services/forging/computeForgeQueueCount";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The bag, wallet and progress after `count` units of a recipe are started in a free queue at `now`: their materials taken
// From the bag and their Mora paid, and their forge points counted toward the game day's cap. Undefined, with nothing spent,
// Where the recipe is not open, the count is more than one queue holds, every queue the rank opens is busy, the materials
// Or the Mora fall short, or the day's cap would be passed
export const startForge = (
  recipe: ForgeRecipe,
  count: number,
  {
    adventureRank,
    inventory,
    now,
    progress,
    wallet,
  }: { adventureRank: number; inventory: Inventory; now: Temporal.Instant; progress: ForgeProgress; wallet: Wallet },
): undefined | { inventory: Inventory; progress: ForgeProgress; wallet: Wallet } => {
  if (
    !checkIsForgeRecipeOpen(recipe, progress, adventureRank) ||
    count < 1 ||
    count > recipe.queueSize ||
    progress.orders.length >= computeForgeQueueCount(adventureRank) ||
    checkIsForgeDailyCapReached(recipe, count, progress, now) ||
    recipe.materials.some(({ count: perUnit, id }) => countInventoryItem(inventory.items, id) < perUnit * count) ||
    wallet[Currency.Mora] < recipe.mora * count
  )
    return undefined;
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const forgedPoints = progress.forgedPointsDay.equals(gameDay) ? progress.forgedPoints : 0;
  return {
    inventory: { items: takeItemCounts(inventory.items, recipe.materials, count), nextId: inventory.nextId },
    progress: {
      ...progress,
      forgedPoints: forgedPoints + recipe.forgePoint * count,
      forgedPointsDay: gameDay,
      orders: [...progress.orders, { count, recipeId: recipe.id, startedAt: now }],
    },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - recipe.mora * count },
  };
};
