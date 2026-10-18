import type { EnemyKindId } from "genshin-world";

import { buildEnemyCamps } from "#src/services/genshinAssets/camps/buildEnemyCamps";
import { CAMP_LEVEL } from "#src/services/genshinAssets/camps/constants";
import { describe, expect, test } from "vitest";

const firstKind = 21010101 as EnemyKindId;
const secondKind = 21010401 as EnemyKindId;

describe("buildEnemyCamps", () => {
  test("a camp's enemies take their family's kind and an estimated level", () => {
    expect.hasAssertions();
    const camps = buildEnemyCamps("mondstadt", [
      { id: "enemy-1", kind: firstKind, position: { x: 0, z: 0 } },
      { id: "enemy-2", kind: firstKind, position: { x: 2, z: 0 } },
      { id: "enemy-3", kind: secondKind, position: { x: 1, z: 1 } },
    ]);
    expect(camps.map(({ members }) => members.map(({ enemyKindId }) => enemyKindId))).toStrictEqual([
      [firstKind, firstKind],
      [secondKind],
    ]);
    expect(camps.flatMap(({ members }) => members.map(({ level }) => level))).toStrictEqual([
      CAMP_LEVEL,
      CAMP_LEVEL,
      CAMP_LEVEL,
    ]);
  });
});
