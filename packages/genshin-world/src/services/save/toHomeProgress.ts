import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeProgressSave } from "#src/models/home/HomeProgressSave";

// The realm's progress read back from its save, each instant read back into its Temporal instant
export const toHomeProgress = ({
  accruedAt,
  claimedRewardIds,
  companionIds,
  learnedBlueprintIds,
  madeBlueprintIds,
  orders,
  realmBounty,
  realmCurrency,
  trustExp,
}: HomeProgressSave): HomeProgress => ({
  accruedAt: Temporal.Instant.from(accruedAt),
  claimedRewardIds,
  companionIds,
  learnedBlueprintIds,
  madeBlueprintIds,
  orders: orders.map(({ blueprintId, startedAt }) => ({ blueprintId, startedAt: Temporal.Instant.from(startedAt) })),
  realmBounty,
  realmCurrency,
  trustExp,
});
