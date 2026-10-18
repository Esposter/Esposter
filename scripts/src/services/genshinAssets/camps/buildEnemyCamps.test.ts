import type { EnemyKindId } from "genshin-world";

import { buildEnemyCamps } from "#src/services/genshinAssets/camps/buildEnemyCamps";
import { CAMP_LEVEL } from "#src/services/genshinAssets/camps/constants";
import { describe, expect, test } from "vitest";

const firstKind = 21010101 as EnemyKindId;
const secondKind = 21010401 as EnemyKindId;
// A stand-in for findAreaAt: the west of x = 50 is one area, the east another, and past z = 100 no area holds the point
const areaIdAt = (x: number, z: number): string | undefined => {
  if (z > 100) return undefined;
  return x < 50 ? "area-west" : "area-east";
};

describe("buildEnemyCamps", () => {
  test("a camp's enemies take their family's kind and an estimated level", () => {
    expect.hasAssertions();
    const camps = buildEnemyCamps(
      "mondstadt",
      [
        { id: "enemy-1", kind: firstKind, position: { x: 0, z: 0 } },
        { id: "enemy-2", kind: firstKind, position: { x: 2, z: 0 } },
        { id: "enemy-3", kind: secondKind, position: { x: 1, z: 1 } },
      ],
      areaIdAt,
    );
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

  test("a camp takes the area its enemies stand in", () => {
    expect.hasAssertions();
    const camps = buildEnemyCamps(
      "mondstadt",
      [
        { id: "enemy-1", kind: firstKind, position: { x: 0, z: 0 } },
        { id: "enemy-2", kind: firstKind, position: { x: 80, z: 0 } },
      ],
      areaIdAt,
    );
    expect(camps.map(({ areaId, id }) => ({ areaId, id }))).toStrictEqual([
      { areaId: "area-west", id: "mondstadt-camp-1" },
      { areaId: "area-east", id: "mondstadt-camp-2" },
    ]);
  });

  test("an enemy in no area is left out of the camps", () => {
    expect.hasAssertions();
    const camps = buildEnemyCamps(
      "mondstadt",
      [
        { id: "enemy-1", kind: firstKind, position: { x: 0, z: 200 } },
        { id: "enemy-2", kind: firstKind, position: { x: 0, z: 0 } },
      ],
      areaIdAt,
    );
    expect(camps.flatMap(({ members }) => members.map(({ id }) => id))).toStrictEqual(["enemy-2"]);
  });
});
