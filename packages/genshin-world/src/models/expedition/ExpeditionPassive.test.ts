import { expeditionPassiveSchema } from "#src/models/expedition/ExpeditionPassive";
import { ExpeditionPassiveKind } from "#src/models/expedition/ExpeditionPassiveKind";
import { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";
import { describe, expect, test } from "vitest";

describe("expeditionPassiveSchema", () => {
  // A reward talent adds to the rewards of the expedition for its hours, so one that names none has nothing to apply to
  test("refuses a reward talent that names no hours, and accepts a time talent that names none", () => {
    expect.hasAssertions();

    const passive = { percent: 1, proudSkillGroupId: 1, region: ExpeditionRegion.Mondstadt };

    expect([
      expeditionPassiveSchema.safeParse({ ...passive, kind: ExpeditionPassiveKind.Reward }).success,
      expeditionPassiveSchema.safeParse({ ...passive, kind: ExpeditionPassiveKind.Time }).success,
    ]).toStrictEqual([false, true]);
  });
});
