import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXEmbeddedTilesetNode } from "#src/models/tmx/node/TMXEmbeddedTilesetNode";

import { Encoding } from "#src/models/Encoding";
import { assertNode } from "#src/test/assertNode.test";
import { createEmbeddedTilesetShared } from "#src/test/createEmbeddedTilesetShared.test";
import { checkIsTMXEmbeddedTilesetNode } from "#src/util/checkIsTMXEmbeddedTilesetNode";
import { describe, expect, test } from "vitest";

describe(checkIsTMXEmbeddedTilesetNode, () => {
  test("embedded tileset node", () => {
    expect.hasAssertions();

    expect(
      checkIsTMXEmbeddedTilesetNode(
        assertNode<TMXEmbeddedTilesetNode>({ $: createEmbeddedTilesetShared(), $$: [], tile: [] }),
      ),
    ).toBe(true);
  });

  test("data node", () => {
    expect.hasAssertions();

    expect(
      checkIsTMXEmbeddedTilesetNode(
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
