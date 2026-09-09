import type { TMXNode } from "#src/models/tmx/node/TMXNode";
import type { TMXObjectNode } from "#src/models/tmx/node/TMXObjectNode";
import type { TMXTileNode } from "#src/models/tmx/node/TMXTileNode";

import { Shape } from "#src/models/Shape";
import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { createObjectShared } from "#src/test/createObjectShared.test";
import { createPropertiesNode } from "#src/test/createPropertiesNode.test";
import { parseTile } from "#src/util/parseTile";
import { describe, expect, test } from "vitest";

describe(parseTile, () => {
  const name = "name";
  const value = "value";
  const id = 0;
  const frame = 1;
  const baseNode = { $: { id }, $$: [] };

  test("parses animation frames", () => {
    expect.hasAssertions();

    const animation = [{ frame: [assertNode<TMXNode<number>>({ $: frame, $$: undefined })] }];
    const tile = parseTile(assertNode<TMXTileNode>({ ...baseNode, animation }));

    expect(tile.animation).toStrictEqual({ frames: [frame] });
  });

  test("parses objects", () => {
    expect.hasAssertions();

    const objectgroup = [
      { object: [assertNode<TMXObjectNode>({ "#name": TMXNodeType.Object, $: createObjectShared(), $$: [] })] },
    ];
    const tile = parseTile(assertNode<TMXTileNode>({ ...baseNode, objectgroup }));

    expect(tile.objects).toStrictEqual([{ ...createObjectShared(), shape: Shape.Rectangle }]);
  });

  test("parses properties", () => {
    expect.hasAssertions();

    const properties = createPropertiesNode(name, value);
    const tile = parseTile(assertNode<TMXTileNode>({ ...baseNode, properties }));

    expect(tile.properties).toStrictEqual([{ name, value }]);
  });
});
