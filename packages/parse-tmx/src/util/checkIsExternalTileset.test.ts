import { assertNode } from "#src/test/assertNode.test";
import { createEmbeddedTilesetShared } from "#src/test/createEmbeddedTilesetShared.test";
import { checkIsExternalTileset } from "#src/util/checkIsExternalTileset";
import { describe, expect, test } from "vitest";

describe(checkIsExternalTileset, () => {
  test("external tileset", () => {
    expect.hasAssertions();

    expect(checkIsExternalTileset(assertNode({ firstgid: 0, source: "a" }))).toBe(true);
  });

  test("embedded tileset", () => {
    expect.hasAssertions();

    expect(checkIsExternalTileset(createEmbeddedTilesetShared())).toBe(false);
  });
});
