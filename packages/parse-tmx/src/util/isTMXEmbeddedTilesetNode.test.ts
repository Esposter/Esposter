import type { TMXDataNode } from "@/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";

import { Encoding } from "@/models/Encoding";
import { assertNode } from "@/test/assertNode.test";
import { createEmbeddedTilesetShared } from "@/test/createEmbeddedTilesetShared.test";
import { isTMXEmbeddedTilesetNode } from "@/util/isTMXEmbeddedTilesetNode";
import { describe, expect, test } from "vitest";

describe(isTMXEmbeddedTilesetNode, () => {
  test("embedded tileset node", () => {
    expect.hasAssertions();

    expect(
      isTMXEmbeddedTilesetNode(
        assertNode<TMXEmbeddedTilesetNode>({ $: createEmbeddedTilesetShared(), $$: [], tile: [] }),
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
