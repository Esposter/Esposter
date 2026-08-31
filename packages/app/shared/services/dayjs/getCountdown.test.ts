import { getCountdown } from "#shared/services/dayjs/getCountdown";
import { describe, expect, test } from "vitest";

describe(getCountdown, () => {
  test.each([
    ["a lapsed deadline", -1, "00:00:00"],
    ["seconds", Temporal.Duration.from({ seconds: 6 }).total("milliseconds"), "00:00:06"],
    ["minutes", Temporal.Duration.from({ minutes: 54 }).total("milliseconds"), "00:54:00"],
    ["hours", Temporal.Duration.from({ hours: 23 }).total("milliseconds"), "23:00:00"],
    ["days", Temporal.Duration.from({ days: 29 }).total("milliseconds"), "29:00:00:00"],
  ])("formats %s", (_name, remainingMs, expected) => {
    expect.hasAssertions();

    expect(getCountdown(remainingMs)).toBe(expected);
  });
});
