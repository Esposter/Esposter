import { weeklyBossDomainsSchema } from "#src/models/domains/WeeklyBossDomain";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readWeeklyBossDomains, () => {
  const level = { dungeonId: 2020, enemyLevel: 39, recommendedRank: 25 };
  const weeklyBossesKey = "domains/weeklyBosses";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("the weekly bosses' trounce domains are read from the game data by their key", async () => {
    expect.hasAssertions();

    const weeklyBossDomains = { "1006": { levels: [level] } };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(weeklyBossDomains));

    await expect(readWeeklyBossDomains("weekly-boss-domains-read")).resolves.toStrictEqual(weeklyBossDomains);
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual([
      `weekly-boss-domains-read/${weeklyBossesKey}/${gameDataLock.objects[weeklyBossesKey]}.json`,
    ]);
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
