import { formatTerrainObj } from "#src/services/genshinAssets/world/formatTerrainObj";
import { describe, expect, test } from "vitest";

describe(formatTerrainObj, () => {
  test("writes a sample a vertex, x mirrored, and each cell's two triangles facing up", () => {
    expect.hasAssertions();

    expect(formatTerrainObj("a", { heights: Float32Array.from([0, 1, 2, 3]), resolution: 2, spacing: 2 }))
      .toMatchInlineSnapshot(`
        "g a
        v 0 0 0
        v -2 1 0
        v 0 2 2
        v -2 3 2
        vt 0 0
        vt 1 0
        vt 0 1
        vt 1 1
        f 1/1 2/2 3/3
        f 2/2 4/4 3/3
        "
      `);
  });
});
