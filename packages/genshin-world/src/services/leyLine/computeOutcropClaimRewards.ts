import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { takeOne } from "@esposter/shared";

// The items a claim of a kind's blossom gives at a World Level: the row for that World Level, and the last row for every
// World Level past the list
export const computeOutcropClaimRewards = ({ worldLevelRewards }: OutcropKindRule, worldLevel: number): RewardItem[] =>
  takeOne(worldLevelRewards, Math.min(worldLevel, worldLevelRewards.length - 1));
