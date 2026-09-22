import { getCountdown } from "#shared/util/date/getCountdown";
import { describe, expect, test } from "vitest";

describe(getCountdown, () => {
  test.each([
    ["a lapsed deadline", -1, "00:00:00"],
    ["seconds", Temporal.Duration.from({ seconds: 1 }).total("milliseconds"), "00:00:01"],
    ["minutes", Temporal.Duration.from({ minutes: 1 }).total("milliseconds"), "00:01:00"],
    ["hours", Temporal.Duration.from({ hours: 1 }).total("milliseconds"), "01:00:00"],
    ["days", Temporal.Duration.from({ days: 1 }).total("milliseconds"), "01:00:00:00"],
  ])("formats %s", (_name, remainingMs, expected) => {
    expect.hasAssertions();

    expect(getCountdown(remainingMs)).toBe(expected);
  });
});
