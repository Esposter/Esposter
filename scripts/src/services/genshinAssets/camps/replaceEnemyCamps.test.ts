import type { EnemyCamp } from "genshin-world";

import { describe, expect, test } from "vitest";

import { replaceEnemyCamps } from "#src/services/genshinAssets/camps/replaceEnemyCamps";

describe("replaceEnemyCamps", () => {
  test("the stand-in camp in mondstadt is replaced", () => {
    expect.hasAssertions();
    const standIn: EnemyCamp = {
      areaId: "galesong-hill",
      id: "windrise-hilichurl-camp",
      members: [{ enemyKindId: 21010101, id: "stand-in-1", level: 2, patrol: [], position: { x: 0, z: 0 } }],
    };
    const built: EnemyCamp = { areaId: "mondstadt", id: "mondstadt-camp-1", members: [] };
    expect(replaceEnemyCamps({ enemyCamps: [standIn], landmarks: [] }, [built])).toStrictEqual({
      enemyCamps: [built],
      landmarks: [],
    });
  });
});
