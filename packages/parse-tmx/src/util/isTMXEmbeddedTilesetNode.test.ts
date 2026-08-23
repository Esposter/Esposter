import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "#src/models/tmx/node/TMXEmbeddedTilesetNode";

import { Encoding } from "#src/models/Encoding";
import { assertNode } from "#src/test/assertNode.test";
import { createEmbeddedTilesetShared } from "#src/test/createEmbeddedTilesetShared.test";
import { isTMXEmbeddedTilesetNode } from "#src/util/isTMXEmbeddedTilesetNode";
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
