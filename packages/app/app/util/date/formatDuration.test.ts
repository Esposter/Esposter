import { formatDuration } from "@/util/date/formatDuration";
import { describe, expect, test } from "vitest";

describe(formatDuration, () => {
  test.each([
    ["a span shorter than a second", 0, "0 seconds"],
    ["a lapsed span", -1, "0 seconds"],
    ["seconds", Temporal.Duration.from({ seconds: 5 }).total("milliseconds"), "5 seconds"],
    [
      "minutes, rounded to the unit it fills",
      Temporal.Duration.from({ seconds: 90 }).total("milliseconds"),
      "2 minutes",
    ],
    ["hours", Temporal.Duration.from({ hours: 2 }).total("milliseconds"), "2 hours"],
    ["days", Temporal.Duration.from({ hours: 26 }).total("milliseconds"), "1 day"],
  ])("writes %s", (_name, ms, expected) => {
    expect.hasAssertions();

    expect(formatDuration(ms)).toBe(expected);
  });
});
