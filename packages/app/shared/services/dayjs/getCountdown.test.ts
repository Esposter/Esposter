import { getCountdown } from "#shared/services/dayjs/getCountdown";
import { DAY, HOUR, MINUTE, SECOND } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getCountdown, () => {
  test.each([
    ["a lapsed deadline", -1, "00:00:00"],
    ["seconds", 6 * SECOND, "00:00:06"],
    ["minutes", 54 * MINUTE, "00:54:00"],
    ["hours", 23 * HOUR, "23:00:00"],
    ["days", 29 * DAY, "29:00:00:00"],
  ])("formats %s", (_name, remainingMs, expected) => {
    expect.hasAssertions();

    expect(getCountdown(remainingMs)).toBe(expected);
  });
});
