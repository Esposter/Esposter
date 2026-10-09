import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";

import { AbyssStarConditionKind } from "#src/models/spiralAbyss/AbyssStarConditionKind";
import { computeAbyssChamberStars } from "#src/services/spiralAbyss/computeAbyssChamberStars";
import { describe, expect, test } from "vitest";

describe(computeAbyssChamberStars, () => {
  const SECONDS_MARK = 90;
  const MONOLITH_MARK = 40;
  const chamber: AbyssChamber = {
    conditions: [
      { kind: AbyssStarConditionKind.LeftTime, threshold: SECONDS_MARK },
      { kind: AbyssStarConditionKind.MonolithHealth, threshold: MONOLITH_MARK },
    ],
    id: 1,
    index: 1,
  };
  const challenge: AbyssChallenge = {
    defeatedHalfCount: 1,
    halfCount: 1,
    monolithPercent: MONOLITH_MARK + 1,
    secondsLeft: SECONDS_MARK + 1,
  };

  test("should earn a star for each condition that holds at the clear", () => {
    expect.hasAssertions();

    expect(computeAbyssChamberStars(chamber, challenge)).toBe(2);
  });

  test("should earn no star for a mark the clock reaches but does not pass", () => {
    expect.hasAssertions();

    expect(computeAbyssChamberStars(chamber, { ...challenge, secondsLeft: SECONDS_MARK })).toBe(1);
  });

  test("should earn no monolith star for a chamber whose monolith has no health", () => {
    expect.hasAssertions();

    expect(computeAbyssChamberStars(chamber, { ...challenge, monolithPercent: undefined })).toBe(1);
  });
});
