import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { createEncounteredMonster } from "@/services/dungeons/monster/createEncounteredMonster";
import { describe, expect, test, vi } from "vitest";

// Pin the growth rolls to their lower bound so the stat gains are deterministic
vi.mock(import("@/util/math/random/createRandomNumber"), () => ({ createRandomNumber: () => 0 }));

describe(createEncounteredMonster, () => {
  const key = MonsterKey.Iguanignite;
  const baseStatistics = getMonsterData(key).statistics;

  test("spawns at the species' base level unchanged", () => {
    expect.hasAssertions();

    const monster = createEncounteredMonster(key, baseStatistics.level);

    expect(monster.statistics).toStrictEqual(baseStatistics);
    expect(monster.status).toStrictEqual({ experience: 0, health: baseStatistics.maxHealth });
  });

  test("levels a fresh monster up to the target level at full health", () => {
    expect.hasAssertions();

    const targetLevel = baseStatistics.level + 2;
    const monster = createEncounteredMonster(key, targetLevel);

    expect(monster.statistics.level).toBe(targetLevel);
    expect(monster.status).toStrictEqual({ experience: 0, health: monster.statistics.maxHealth });
  });
});
