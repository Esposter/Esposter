import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeProgressSave } from "#src/models/home/HomeProgressSave";

// The realm's progress as its save holds it, each instant as its ISO string
export const toHomeProgressSave = ({
  accruedAt,
  claimedRewardIds,
  companionIds,
  learnedBlueprintIds,
  madeBlueprintIds,
  orders,
  realmBounty,
  realmCurrency,
  trustExp,
}: HomeProgress): HomeProgressSave => ({
  accruedAt: accruedAt.toString(),
  claimedRewardIds,
  companionIds,
  learnedBlueprintIds,
  madeBlueprintIds,
  orders: orders.map(({ blueprintId, startedAt }) => ({ blueprintId, startedAt: startedAt.toString() })),
  realmBounty,
  realmCurrency,
  trustExp,
});
