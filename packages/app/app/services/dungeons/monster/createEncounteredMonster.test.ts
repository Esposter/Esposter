import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { createEncounteredMonster } from "@/services/dungeons/monster/createEncounteredMonster";
import { describe, expect, test, vi } from "vitest";

// Pin the growth rolls to their lower bound so the stat gains are deterministic
vi.mock(import("#shared/util/math/random/createRandomNumber"), () => ({ createRandomNumber: () => 0 }));

describe(createEncounteredMonster, () => {
  const key = MonsterKey.Iguanignite;
  const baseStatistics = getMonsterData(key).stats;

  test("spawns at the species' base level unchanged", () => {
    expect.hasAssertions();

    const monster = createEncounteredMonster(key, baseStatistics.level);

    expect(monster.stats).toStrictEqual(baseStatistics);
    expect(monster.status).toStrictEqual({ exp: 0, hp: baseStatistics.maxHp });
  });

  test("levels a fresh monster up to the target level at full health", () => {
    expect.hasAssertions();

    const targetLevel = baseStatistics.level + 2;
    const monster = createEncounteredMonster(key, targetLevel);

    expect(monster.stats.level).toBe(targetLevel);
    expect(monster.status).toStrictEqual({ exp: 0, hp: monster.stats.maxHp });
  });
});
