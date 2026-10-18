import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { weeklyBossDomainsSchema } from "#src/models/domains/WeeklyBossDomain";
import { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";
import { describe, expect, test } from "vitest";

describe(readWeeklyBossDomains, () => {
  test("the weekly bosses' trounce domains are read from the game data the publish wrote", async () => {
    expect.hasAssertions();

    const domains = await readWeeklyBossDomains(GAME_DATA_LOCAL_BASE_URL);

    expect(domains).toHaveProperty(["1006", "levels"]);
    expect(domains["1006"]?.levels.length).toBeGreaterThan(0);
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
