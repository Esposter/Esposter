import type { TMXDataNode } from "@/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";

import { Encoding } from "@/models/Encoding";
import { assertNode } from "@/test/assertNode.test";
import { isTMXEmbeddedTilesetNode } from "@/util/isTMXEmbeddedTilesetNode";
import { describe, expect, test } from "vitest";

describe(isTMXEmbeddedTilesetNode, () => {
  test("embedded tileset node", () => {
    expect.hasAssertions();

    expect(
      isTMXEmbeddedTilesetNode(
        assertNode<TMXEmbeddedTilesetNode>({
          $: {
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
          },
          $$: [],
          tile: [],
        }),
      ),
    ).toBe(true);
  });

  test("data node", () => {
    expect.hasAssertions();

    expect(
      isTMXEmbeddedTilesetNode(
        assertNode<TMXDataNode>({
          $: {
            encoding: Encoding.Base64,
          },
          $$: undefined,
          _: "",
        }),
      ),
    ).toBe(false);
  });
});
