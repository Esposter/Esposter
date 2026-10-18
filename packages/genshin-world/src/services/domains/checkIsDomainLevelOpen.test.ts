import type { DomainLevel } from "#src/models/domains/DomainSchedule";

import { DomainKind } from "#src/models/domains/DomainKind";
import { checkIsDomainLevelOpen } from "#src/services/domains/checkIsDomainLevelOpen";
import { describe, expect, test } from "vitest";

describe(checkIsDomainLevelOpen, () => {
  // The epoch fell on a Thursday, so four days after it is a Monday, the first day of a pair this level is set for
  const EPOCH_DAY = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate();
  const MONDAY = EPOCH_DAY.add({ days: 4 });
  const TUESDAY = EPOCH_DAY.add({ days: 5 });
  const LEVEL: DomainLevel = { dungeonId: 1001, enemyLevel: 37, recommendedRank: 30, scheduledDaysOfWeek: [1, 4] };

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
});
