import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";
import type { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";

import { ExpeditionPassiveKind } from "#src/models/expedition/ExpeditionPassiveKind";

// The percent of an expedition's time the talents of the character sent take off it, in its region
export const computeExpeditionTimeReductionPercent = (
  passives: readonly ExpeditionPassive[],
  region: ExpeditionRegion,
): number =>
  passives
    .filter((passive) => passive.kind === ExpeditionPassiveKind.Time && passive.region === region)
    .reduce((percent, passive) => percent + passive.percent, 0);

// The percent the talents of the character sent add to an expedition's rewards, in its region for its hours
export const computeExpeditionRewardPercent = (
  passives: readonly ExpeditionPassive[],
  region: ExpeditionRegion,
  hours: number,
): number =>
  passives
    .filter(
      (passive) =>
        passive.kind === ExpeditionPassiveKind.Reward && passive.region === region && passive.hours === hours,
    )
    .reduce((percent, passive) => percent + passive.percent, 0);

// Both effects of the character's talents on one expedition: the percent its time is shortened by and the percent its rewards
// Are added to
export const computeExpeditionPassives = (
  passives: readonly ExpeditionPassive[],
  region: ExpeditionRegion,
  hours: number,
): { rewardPercent: number; timeReductionPercent: number } => ({
  rewardPercent: computeExpeditionRewardPercent(passives, region, hours),
  timeReductionPercent: computeExpeditionTimeReductionPercent(passives, region),
});
