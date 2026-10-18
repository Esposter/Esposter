import { checkIsWeeklyBossDomainOpen } from "#src/services/bosses/checkIsWeeklyBossDomainOpen";
import { describe, expect, test } from "vitest";

describe(checkIsWeeklyBossDomainOpen, () => {
  test("a weekly boss's domain opens once its introducing quest is done", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossDomainOpen([1, 2], new Set(["1", "2", "3"]))).toBe(true);
  });

  test("a weekly boss's domain is locked before its introducing quest", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossDomainOpen([1, 2], new Set(["1"]))).toBe(false);
  });
});
