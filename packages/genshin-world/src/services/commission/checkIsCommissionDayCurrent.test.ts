import { checkIsCommissionDayCurrent } from "#src/services/commission/checkIsCommissionDayCurrent";
import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(checkIsCommissionDayCurrent, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const dailyReset = epoch.toPlainDate().toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });
  const now = dailyReset.add({ hours: 12 });

  test("a day dealt before the daily reset is dealt again", () => {
    expect.hasAssertions();
    expect(checkIsCommissionDayCurrent(dailyReset.subtract({ minutes: 1 }).toInstant(), now)).toBe(false);
  });

  test("a day dealt at or after the daily reset is kept", () => {
    expect.hasAssertions();
    expect(checkIsCommissionDayCurrent(dailyReset.toInstant(), now)).toBe(true);
  });
});
