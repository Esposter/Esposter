import { assertNode } from "@/test/assertNode.test";
import { createEmbeddedTilesetShared } from "@/test/createEmbeddedTilesetShared.test";
import { isExternalTileset } from "@/util/isExternalTileset";
import { describe, expect, test } from "vitest";

describe(isExternalTileset, () => {
  test("external tileset", () => {
    expect.hasAssertions();

    expect(isExternalTileset(assertNode({ firstgid: 0, source: "a" }))).toBe(true);
  });

  test("embedded tileset", () => {
    expect.hasAssertions();

    expect(isExternalTileset(createEmbeddedTilesetShared())).toBe(false);
  });
});
