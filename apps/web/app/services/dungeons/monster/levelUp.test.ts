import { FileKey } from "#shared/generated/phaser/FileKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { getLevelExperience } from "@/services/dungeons/monster/getLevelExperience";
import { levelUp } from "@/services/dungeons/monster/levelUp";
import { describe, expect, test, vi } from "vitest";

// Pin the growth rolls to their lower bound so the stat gains are deterministic
vi.mock(import("@/util/math/random/createRandomNumber"), () => ({ createRandomNumber: () => 0 }));

describe(levelUp, () => {
  test("grows statistics and consumes the level's experience", () => {
    expect.hasAssertions();

    const monster = new Monster(FileKey.UIMonstersIguanignite);
    const { attack, defense, level, maxHealth } = monster.statistics;
    monster.status.experience = getLevelExperience(level);
    levelUp(monster);

    expect(monster.statistics.level).toBe(level + 1);
    expect(monster.statistics.maxHealth).toBe(maxHealth + 5);
    expect(monster.statistics.attack).toBe(attack + 1);
    expect(monster.statistics.defense).toBe(defense + 1);
    expect(monster.status.experience).toBe(0);
  });
});
