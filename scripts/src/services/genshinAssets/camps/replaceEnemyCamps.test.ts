import type { EnemyCamp } from "genshin-world";

import { replaceEnemyCamps } from "#src/services/genshinAssets/camps/replaceEnemyCamps";
import { describe, expect, test } from "vitest";

describe(replaceEnemyCamps, () => {
  test("the stand-in camp in Mondstadt is replaced", () => {
    expect.hasAssertions();
    const standIn: EnemyCamp = {
      areaId: "",
      id: "",
      members: [{ enemyKindId: 21010101, id: "", level: 0, patrol: [], position: { x: 0, z: 0 } }],
    };
    const built: EnemyCamp = { areaId: "", id: "", members: [] };
    expect(replaceEnemyCamps({ enemyCamps: [standIn], landmarks: [] }, [built])).toStrictEqual({
      enemyCamps: [built],
      landmarks: [],
    });
  });
});
