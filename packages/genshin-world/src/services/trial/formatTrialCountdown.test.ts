import { formatTrialCountdown } from "#src/services/trial/formatTrialCountdown";
import { describe, expect, test } from "vitest";

describe(formatTrialCountdown, () => {
  test("a countdown reads its minutes and its seconds, the seconds always two digits", () => {
    expect.hasAssertions();

    expect(formatTrialCountdown(300)).toBe("5:00");
    expect(formatTrialCountdown(61)).toBe("1:01");
    expect(formatTrialCountdown(9)).toBe("0:09");
  });
});
