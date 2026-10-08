import { DomainKind } from "#src/models/domains/DomainKind";
import { checkIsDomainKindOpenOnDay } from "#src/services/domains/checkIsDomainKindOpenOnDay";
import { describe, expect, test } from "vitest";

// The epoch fell on a Thursday, so three, four and five days after it are a Sunday, a Monday and a Tuesday
const EPOCH_DAY = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate();
const SUNDAY = EPOCH_DAY.add({ days: 3 });
const MONDAY = EPOCH_DAY.add({ days: 4 });
const TUESDAY = EPOCH_DAY.add({ days: 5 });
const SCHEDULED_DAYS_OF_WEEK = [1, 4];

describe(checkIsDomainKindOpenOnDay, () => {
  test("a Domain of Blessing is open every day, whatever its set days are", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenOnDay(DomainKind.Blessing, TUESDAY, [])).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Blessing, SUNDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(true);
  });

  test("a Domain of Forgery or Mastery is open on its set days and on every Sunday, and closed on any other day", () => {
    expect.hasAssertions();

    expect(checkIsDomainKindOpenOnDay(DomainKind.Forgery, MONDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Forgery, TUESDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(false);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Forgery, SUNDAY, SCHEDULED_DAYS_OF_WEEK)).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Mastery, TUESDAY, [2, 6])).toBe(true);
    expect(checkIsDomainKindOpenOnDay(DomainKind.Mastery, MONDAY, [2, 6])).toBe(false);
  });
});
