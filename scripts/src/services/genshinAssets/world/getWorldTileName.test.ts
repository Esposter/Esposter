import { getWorldTileName } from "#src/services/genshinAssets/world/getWorldTileName";
import { describe, expect, test } from "vitest";

describe(getWorldTileName, () => {
  test("names a tile by its column and row, a negative row keeping its sign", () => {
    expect.hasAssertions();

    expect(getWorldTileName(1, -2)).toBe("BigWorld_1_-2");
  });
});
