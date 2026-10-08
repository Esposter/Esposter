import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { computeBlossomClaimResin } from "#src/services/originalResin/computeBlossomClaimResin";
import { WEEKLY_BOSS_CHEAP_CLAIMS } from "#src/services/originalResin/constants";
import { describe, expect, test } from "vitest";

describe(computeBlossomClaimResin, () => {
  test("a weekly boss's first claims in the week cost the cheap price, and the claims after them the full price", () => {
    expect.hasAssertions();

    expect(computeBlossomClaimResin(BlossomKind.WeeklyBoss, 0)).toBe(30);
    expect(computeBlossomClaimResin(BlossomKind.WeeklyBoss, WEEKLY_BOSS_CHEAP_CLAIMS - 1)).toBe(30);
    expect(computeBlossomClaimResin(BlossomKind.WeeklyBoss, WEEKLY_BOSS_CHEAP_CLAIMS)).toBe(60);
  });

  test("a ley line, a domain and a normal boss cost their table's price a claim", () => {
    expect.hasAssertions();

    expect(computeBlossomClaimResin(BlossomKind.LeyLine, 0)).toBe(20);
    expect(computeBlossomClaimResin(BlossomKind.Domain, 0)).toBe(20);
    expect(computeBlossomClaimResin(BlossomKind.NormalBoss, 0)).toBe(40);
  });
});
