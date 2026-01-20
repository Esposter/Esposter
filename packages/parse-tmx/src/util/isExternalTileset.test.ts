import type { TMXEmbeddedTilesetShared } from "@/models/tmx/shared/TMXEmbeddedTilesetShared";
import type { TMXExternalTilesetShared } from "@/models/tmx/shared/TMXExternalTilesetShared";

import { assertNode } from "@/test/assertNode.test";
import { isExternalTileset } from "@/util/isExternalTileset";
import { describe, expect, test } from "vitest";

describe(isExternalTileset, () => {
  test("external tileset", () => {
    expect.hasAssertions();

    expect(isExternalTileset(assertNode<TMXExternalTilesetShared>({ firstgid: 0, source: "a" }))).toBe(true);
  });

  test("embedded tileset", () => {
    expect.hasAssertions();

    expect(
      isExternalTileset(
        assertNode<TMXEmbeddedTilesetShared>({
          columns: 0,
          firstgid: 0,
          imageheight: 0,
          imagewidth: 0,
          margin: 0,
          name: "",
          spacing: 0,
          tilecount: 0,
          tileheight: 0,
          tilewidth: 0,
        }),
      ),
    ).toBe(false);
  });
});
