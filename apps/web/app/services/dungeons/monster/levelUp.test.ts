import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { getLevelExperience } from "@/services/dungeons/monster/getLevelExperience";
import { levelUp } from "@/services/dungeons/monster/levelUp";
import { createRandomNumber } from "@/util/math/random/createRandomNumber";
import { describe, expect, test, vi } from "vitest";

// Pin the growth rolls to their lower bound by default so the stat gains are deterministic
vi.mock(import("@/util/math/random/createRandomNumber"), () => ({ createRandomNumber: vi.fn<() => number>(() => 0) }));

describe(levelUp, () => {
  test("grows statistics and consumes the level's experience", () => {
    expect.hasAssertions();

    const monster = new Monster(MonsterKey.Iguanignite);
    const { attack, defense, level, maxHealth } = monster.statistics;
    monster.status.experience = getLevelExperience(level);
    levelUp(monster);

    expect(monster.statistics.level).toBe(level + 1);
    expect(monster.statistics.maxHealth).toBe(maxHealth + 5);
    expect(monster.statistics.attack).toBe(attack + 1);
    expect(monster.statistics.defense).toBe(defense + 1);
    expect(monster.status.experience).toBe(0);
  });

  test("reaches the top of each growth band", () => {
    expect.hasAssertions();

    const monster = new Monster(MonsterKey.Iguanignite);
    const { attack, defense, maxHealth } = monster.statistics;
    // One roll each for maximum health, attack and defense, in that order, at the top of their ranges
    vi.mocked(createRandomNumber).mockReturnValueOnce(3.999).mockReturnValueOnce(1.999).mockReturnValueOnce(1.999);
    levelUp(monster);

    expect(monster.statistics.maxHealth).toBe(maxHealth + 8);
    expect(monster.statistics.attack).toBe(attack + 2);
    expect(monster.statistics.defense).toBe(defense + 2);
  });
});
