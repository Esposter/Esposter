import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { describe, expect, test } from "vitest";

describe(getMonsterData, () => {
  const key = MonsterKey.Iguanignite;

  // Every monster of a species is built from its data, and battle goes on to change what it was built from
  test("hands out a copy, so a change to one monster never reaches its species", () => {
    expect.hasAssertions();

    const { level } = getMonsterData(key).statistics;
    getMonsterData(key).statistics.level = level + 1;

    expect(getMonsterData(key).statistics.level).toBe(level);
  });
});
