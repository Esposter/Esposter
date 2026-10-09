import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ForgeTalentKind } from "#src/models/forging/ForgeTalent";
import { checkIsForgeDailyCapReached } from "#src/services/forging/checkIsForgeDailyCapReached";
import { checkIsForgeRecipeOpen } from "#src/services/forging/checkIsForgeRecipeOpen";
import { checkIsForgeRecipeRefusedInRealm } from "#src/services/forging/checkIsForgeRecipeRefusedInRealm";
import { computeForgeQueueCount } from "#src/services/forging/computeForgeQueueCount";
import { computeForgeTalents } from "#src/services/forging/computeForgeTalents";
import { refundForgeOres } from "#src/services/forging/refundForgeOres";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The bag, wallet and progress after `count` units of a recipe are started in a free queue at `now`: their materials taken
// From the bag and their Mora paid, their forge points counted toward the game day's cap, and any forging talent the party's
// Characters give this recipe's forge type applied, its seconds saved and its ores refunded. Undefined, with nothing spent,
// Where the recipe is not open, the count is more than one queue holds, every queue the rank opens is busy, the materials
// Or the Mora fall short, the day's cap would be passed, or the Serenitea Pot refuses the recipe
export const startForge = (
  recipe: ForgeRecipe,
  count: number,
  {
    adventureRank,
    definitions,
    inventory,
    isInRealm,
    now,
    partyCharacterIds,
    progress,
    wallet,
  }: {
    adventureRank: number;
    definitions: Map<number, ItemDefinition>;
    inventory: Inventory;
    isInRealm: boolean;
    now: Temporal.Instant;
    partyCharacterIds: number[];
    progress: ForgeProgress;
    wallet: Wallet;
  },
): undefined | { inventory: Inventory; progress: ForgeProgress; wallet: Wallet } => {
  if (
    !checkIsForgeRecipeOpen(recipe, progress, adventureRank) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > recipe.queueSize ||
    progress.orders.length >= computeForgeQueueCount(adventureRank) ||
    checkIsForgeDailyCapReached(recipe, count, progress, now) ||
    (isInRealm && checkIsForgeRecipeRefusedInRealm(recipe)) ||
    recipe.materials.some(({ count: perUnit, id }) => countInventoryItem(inventory.items, id) < perUnit * count) ||
    wallet[Currency.Mora] < recipe.mora * count
  )
    return undefined;
  const talents = computeForgeTalents(partyCharacterIds).filter(({ forgeType }) => forgeType === recipe.forgeType);
  const unitSeconds = Math.round(
    talents.reduce(
      (seconds, { kind, ratio }) => (kind === ForgeTalentKind.ReduceTime ? seconds * (1 - ratio) : seconds),
      recipe.seconds,
    ),
  );
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const forgedPoints = progress.forgedPointsDay.equals(gameDay) ? progress.forgedPoints : 0;
  const takenInventory = { items: takeItemCounts(inventory.items, recipe.materials, count), nextId: inventory.nextId };
  return {
    inventory: refundForgeOres(takenInventory, recipe, count, talents, definitions),
    progress: {
      ...progress,
      forgedPoints: forgedPoints + recipe.forgePoint * count,
      forgedPointsDay: gameDay,
      orders: [...progress.orders, { count, recipeId: recipe.id, startedAt: now, unitSeconds }],
    },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - recipe.mora * count },
  };
};
