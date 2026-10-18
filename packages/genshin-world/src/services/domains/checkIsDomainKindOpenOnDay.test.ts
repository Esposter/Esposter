import { DomainKind } from "#src/models/domains/DomainKind";
import { checkIsDomainKindOpenOnDay } from "#src/services/domains/checkIsDomainKindOpenOnDay";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsDomainKindOpenOnDay, () => {
  // The epoch fell on a Thursday in the server's zone.
  // The resets three, four and five days after it open a Sunday, a Monday and a Tuesday.
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const DAILY_RESET = EPOCH.subtract({ hours: GAME_DAY_START_HOUR });
  const RESET_ZONED = DAILY_RESET.toZonedDateTimeISO(GAME_TIME_ZONE);
  const SUNDAY = RESET_ZONED.add({ days: 3 }).toInstant();
  const MONDAY = RESET_ZONED.add({ days: 4 }).toInstant();
  const TUESDAY = RESET_ZONED.add({ days: 5 }).toInstant();
  const SCHEDULED_DAYS_OF_WEEK = [1, 4];

  test("a Domain of Blessing or Trounce is open every day, whatever its set days are", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenOnDay(DomainKind.Blessing, TUESDAY, [])).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Blessing, SUNDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Trounce, TUESDAY, [])).toBe(true);
  });

  test("a Domain of Forgery or Mastery is open on its set days and on every Sunday, and closed on any other day", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenOnDay(DomainKind.Forgery, MONDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Forgery, TUESDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(false);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Forgery, SUNDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Mastery, TUESDAY, [2, 6])).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Mastery, MONDAY, [2, 6])).toBe(false);
  });

  test("a moment before the reset takes the previous game day's opening", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenOnDay(DomainKind.Mastery, TUESDAY.subtract({ milliseconds: 1 }), [2, 6])).toBe(false);
  });

  test("a moment at the reset takes the new game day's opening", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenOnDay(DomainKind.Mastery, TUESDAY, [2, 6])).toBe(true);
  });
});
