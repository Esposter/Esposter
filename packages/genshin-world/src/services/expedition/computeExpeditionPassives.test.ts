import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";

import { ExpeditionPassiveKind } from "#src/models/expedition/ExpeditionPassiveKind";
import { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";
import {
  computeExpeditionRewardPercent,
  computeExpeditionTimeReductionPercent,
} from "#src/services/expedition/computeExpeditionPassives";
import { describe, expect, test } from "vitest";

const TIME_PASSIVE: ExpeditionPassive = {
  kind: ExpeditionPassiveKind.Time,
  percent: 25,
  proudSkillGroupId: 3223,
  region: ExpeditionRegion.Mondstadt,
};
const REWARD_PASSIVE: ExpeditionPassive = {
  hours: 20,
  kind: ExpeditionPassiveKind.Reward,
  percent: 25,
  proudSkillGroupId: 6023,
  region: ExpeditionRegion.Liyue,
};

describe(computeExpeditionTimeReductionPercent, () => {
  test("a time talent shortens only the expeditions in its region", () => {
    expect.hasAssertions();

    expect(computeExpeditionTimeReductionPercent([TIME_PASSIVE], ExpeditionRegion.Liyue)).toBe(0);
    expect(computeExpeditionTimeReductionPercent([TIME_PASSIVE], ExpeditionRegion.Mondstadt)).toBe(25);
  });
});

describe(computeExpeditionRewardPercent, () => {
  test("a reward talent adds only to the expeditions in its region for its hours", () => {
    expect.hasAssertions();

    expect(computeExpeditionRewardPercent([REWARD_PASSIVE], ExpeditionRegion.Liyue, 4)).toBe(0);
    expect(computeExpeditionRewardPercent([REWARD_PASSIVE], ExpeditionRegion.Mondstadt, 20)).toBe(0);
    expect(computeExpeditionRewardPercent([REWARD_PASSIVE], ExpeditionRegion.Liyue, 20)).toBe(25);
  });
});
