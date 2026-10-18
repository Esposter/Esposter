import type { DomainLevel } from "#src/models/domains/DomainSchedule";

import { DomainKind } from "#src/models/domains/DomainKind";
import { checkIsDomainLevelOpen } from "#src/services/domains/checkIsDomainLevelOpen";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsDomainLevelOpen, () => {
  // The epoch fell on a Thursday in the server's zone, so the reset four days after it opens a Monday and five a Tuesday
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const DAILY_RESET = EPOCH.subtract({ hours: GAME_DAY_START_HOUR });
  const RESET_ZONED = DAILY_RESET.toZonedDateTimeISO(GAME_TIME_ZONE);
  const MONDAY = RESET_ZONED.add({ days: 4 }).toInstant();
  const TUESDAY = RESET_ZONED.add({ days: 5 }).toInstant();
  const LEVEL: DomainLevel = {
    dungeonId: 1001,
    disorder: "",
    enemyLevel: 37,
    recommendedRank: 30,
    resinCost: 0,
    scheduledDaysOfWeek: [1, 4],
    treeArtifacts: [],
    treeRewards: [],
  };

  test("a level at or below the player's Adventure Rank is open", () => {
    expect.hasAssertions();

    expect(checkIsDomainLevelOpen(DomainKind.Mastery, LEVEL, 30, MONDAY)).toBe(true);
    expect(checkIsDomainLevelOpen(DomainKind.Mastery, LEVEL, 35, MONDAY)).toBe(true);
  });

  test("a level above the player's Adventure Rank is refused", () => {
    expect.hasAssertions();

    expect(checkIsDomainLevelOpen(DomainKind.Mastery, LEVEL, 28, MONDAY)).toBe(false);
  });

  test("a level whose domain is closed today is refused", () => {
    expect.hasAssertions();

    expect(checkIsDomainLevelOpen(DomainKind.Mastery, LEVEL, 30, TUESDAY)).toBe(false);
  });

  test("a moment before the reset takes the previous game day's opening", () => {
    expect.hasAssertions();

    expect(checkIsDomainLevelOpen(DomainKind.Mastery, LEVEL, 30, TUESDAY.subtract({ milliseconds: 1 }))).toBe(true);
  });
});
