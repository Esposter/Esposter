import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeProgressSave } from "#src/models/home/HomeProgressSave";

// The realm's progress read back from its save, each instant read back into its Temporal instant
export const toHomeProgress = ({
  claimedRewardIds,
  companionIds,
  learnedBlueprintIds,
  madeBlueprintIds,
  orders,
  realmBounty,
  realmBountyAccruedAt,
  realmCurrency,
  realmCurrencyAccruedAt,
  trustExp,
}: HomeProgressSave): HomeProgress => ({
  claimedRewardIds,
  companionIds,
  learnedBlueprintIds,
  madeBlueprintIds,
  orders: orders.map(({ blueprintId, startedAt }) => ({ blueprintId, startedAt: Temporal.Instant.from(startedAt) })),
  realmBounty,
  realmBountyAccruedAt: Temporal.Instant.from(realmBountyAccruedAt),
  realmCurrency,
  realmCurrencyAccruedAt: Temporal.Instant.from(realmCurrencyAccruedAt),
  trustExp,
});
