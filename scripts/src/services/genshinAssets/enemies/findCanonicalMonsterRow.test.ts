import { MONSTER_CODEX_TYPE } from "#src/services/genshinAssets/enemies/constants";
import { findCanonicalMonsterRow } from "#src/services/genshinAssets/enemies/findCanonicalMonsterRow";
import { describe, expect, test } from "vitest";

describe(findCanonicalMonsterRow, () => {
  const monsterRows = [
    { describeId: 10101, id: 21010101 },
    { describeId: 10101, id: 21010103 },
    { describeId: 61603, id: 26160302 },
  ];

  test("a describe entry resolves to the monster its codex row names", () => {
    expect.hasAssertions();

    const animalCodexRows = [{ describeId: 10101, id: 21010101, type: MONSTER_CODEX_TYPE }];

    expect(findCanonicalMonsterRow(animalCodexRows, monsterRows, 10101)).toStrictEqual({
      describeId: 10101,
      id: 21010101,
    });
  });

  test("a codex row naming a monster filed under another entry resolves to nothing", () => {
    expect.hasAssertions();

    const animalCodexRows = [{ describeId: 61701, id: 26160302, type: MONSTER_CODEX_TYPE }];

    expect(findCanonicalMonsterRow(animalCodexRows, monsterRows, 61701)).toBeUndefined();
  });

  test("a codex row naming no monster row resolves to nothing", () => {
    expect.hasAssertions();

    const animalCodexRows = [{ describeId: 21104, id: 22110401, type: MONSTER_CODEX_TYPE }];

    expect(findCanonicalMonsterRow(animalCodexRows, monsterRows, 21104)).toBeUndefined();
  });

  test("a describe entry with no monster codex row resolves to nothing", () => {
    expect.hasAssertions();

    expect(findCanonicalMonsterRow([], monsterRows, 10101)).toBeUndefined();
  });
});
