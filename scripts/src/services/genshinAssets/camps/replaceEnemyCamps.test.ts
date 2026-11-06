import type { EnemyCamp } from "genshin-world";

import { replaceEnemyCamps } from "#src/services/genshinAssets/camps/replaceEnemyCamps";
import { describe, expect, test } from "vitest";

describe("replaceEnemyCamps", () => {
  test("the stand-in camp in Mondstadt is replaced", () => {
    expect.hasAssertions();
    const standIn: EnemyCamp = {
      areaId: "mondstadt",
      id: "mondstadt-stand-in-camp",
      members: [{ enemyKindId: 21010101, id: "stand-in-1", level: 2, patrol: [], position: { x: 0, z: 0 } }],
    };
    const built: EnemyCamp = { areaId: "mondstadt", id: "mondstadt-camp-1", members: [] };
    expect(replaceEnemyCamps({ enemyCamps: [standIn], landmarks: [] }, [built])).toStrictEqual({
      enemyCamps: [built],
      landmarks: [],
    });
  });
});
