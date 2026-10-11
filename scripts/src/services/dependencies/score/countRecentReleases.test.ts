import { describe, expect, test } from "vitest";
import { countRecentReleases } from "#src/services/dependencies/score/countRecentReleases";

describe(countRecentReleases, () => {
  test("counts a release on the window's first day and leaves out the one before it", () => {
    expect.hasAssertions();

    const epoch = Temporal.Instant.fromEpochMilliseconds(0);
    const today = epoch.toZonedDateTimeISO("UTC").toPlainDate().add({ years: 50 });
    const windowStart = today.subtract({ months: 24 });
    const time = {
      created: epoch.toString(),
      modified: epoch.toString(),
      "1.0.0": windowStart.toZonedDateTime("UTC").toInstant().toString(),
      "0.9.0": windowStart.subtract({ days: 1 }).toZonedDateTime("UTC").toInstant().toString(),
    };

    expect(countRecentReleases(time, today)).toBe(1);
  });
});
