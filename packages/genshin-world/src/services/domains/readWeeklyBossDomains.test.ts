import { weeklyBossDomainsSchema } from "#src/models/domains/WeeklyBossDomain";
import { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";
import { describe, expect, test } from "vitest";

describe(readWeeklyBossDomains, () => {
  test("no weekly boss domain is read before a publish has written them to the hosted game data", async () => {
    expect.hasAssertions();

    await expect(readWeeklyBossDomains("https://example.invalid/")).resolves.toStrictEqual({});
  });
});

describe("weeklyBossDomainsSchema", () => {
  const level = { dungeonId: 2020, enemyLevel: 39, recommendedRank: 25 };

  test("a weekly boss's levels are read as the domains dataset writes them", () => {
    expect.hasAssertions();

    expect(weeklyBossDomainsSchema.parse({ "1006": { levels: [level] } })).toStrictEqual({
      "1006": { levels: [level] },
    });
  });

  test("a level missing its enemy level is refused", () => {
    expect.hasAssertions();

    const { enemyLevel: _enemyLevel, ...incomplete } = level;

    expect(weeklyBossDomainsSchema.safeParse({ "1006": { levels: [incomplete] } }).success).toBe(false);
  });
});
