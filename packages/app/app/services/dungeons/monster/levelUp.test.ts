import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";
import { levelUp } from "@/services/dungeons/monster/levelUp";
import { describe, expect, test, vi } from "vitest";

// Pin the growth rolls to their lower bound so the stat gains are deterministic
vi.mock(import("#shared/util/math/random/createRandomNumber"), () => ({ createRandomNumber: () => 0 }));

describe(levelUp, () => {
  test("grows stats and consumes the level's experience", () => {
    expect.hasAssertions();

    const monster = new Monster(MonsterKey.Iguanignite);
    const { attack, defense, level, maxHp } = monster.stats;
    monster.status.exp = calculateLevelExperience(level);
    levelUp(monster);

    expect(monster.stats.level).toBe(level + 1);
    expect(monster.stats.maxHp).toBe(maxHp + 5);
    expect(monster.stats.attack).toBe(attack + 1);
    expect(monster.stats.defense).toBe(defense + 1);
    expect(monster.status.exp).toBe(0);
  });
});
