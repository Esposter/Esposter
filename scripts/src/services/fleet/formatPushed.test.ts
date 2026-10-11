import { formatPushed } from "#src/services/fleet/formatPushed";
import { describe, expect, test } from "vitest";

describe(formatPushed, () => {
  const LAST_PUSH_AT = Temporal.Instant.fromEpochMilliseconds(0).toString();
  const LAST_PUSH_SHA = "0".repeat(40);

  test("dashes a machine that has landed nothing", () => {
    expect.hasAssertions();

    expect(formatPushed(undefined, 0)).toBe("—");
  });

  test("reads how long ago the last commit landed", () => {
    expect.hasAssertions();

    const now = Temporal.Duration.from({ minutes: 3 }).total("milliseconds");
    expect(formatPushed({ at: LAST_PUSH_AT, sha: LAST_PUSH_SHA }, now)).toBe("3 min ago");
  });
});
