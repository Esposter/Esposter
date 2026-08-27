import { dayjs } from "#shared/services/dayjs";
import { getCountdown } from "#shared/services/dayjs/getCountdown";
import { describe, expect, test } from "vitest";

describe(getCountdown, () => {
  test.each([
    ["a lapsed deadline", -1, "00:00:00"],
    ["seconds", dayjs.duration(6, "seconds").asMilliseconds(), "00:00:06"],
    ["minutes", dayjs.duration(54, "minutes").asMilliseconds(), "00:54:00"],
    ["hours", dayjs.duration(23, "hours").asMilliseconds(), "23:00:00"],
    ["days", dayjs.duration(29, "days").asMilliseconds(), "29:00:00:00"],
  ])("formats %s", (_name, remainingMs, expected) => {
    expect.hasAssertions();

    expect(getCountdown(remainingMs)).toBe(expected);
  });
});
