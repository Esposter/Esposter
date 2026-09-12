import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXGroupLayerNode } from "#src/models/tmx/node/TMXGroupLayerNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";

import { Encoding } from "#src/models/Encoding";
import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { parseNode } from "#src/services/parseNode";
import { assertNode } from "#src/test/assertNode.test";
import { createLayerShared } from "#src/test/createLayerShared.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseNode, () => {
  const gid = 1;
  const expectedCount = 1;
  const objectGroupNode = assertNode<TMXLayerNode>({
    "#name": TMXNodeType.Objectgroup,
    $: createLayerShared(),
    $$: [],
  });

  test("parses a tile layer's data", async () => {
    expect.hasAssertions();

    const data = [assertNode<TMXDataNode>({ $: { encoding: Encoding.Csv }, $$: undefined, _: `${gid}` })];
    const layer = await parseNode(
      assertNode<TMXLayerNode>({ "#name": TMXNodeType.Layer, $: createLayerShared(), $$: [], data }),
      expectedCount,
      false,
    );

    expect(layer.data).toStrictEqual([gid]);
  });

  test("parses a group's layers", async () => {
    expect.hasAssertions();

    const group = await parseNode(
      assertNode<TMXGroupLayerNode>({
        "#name": TMXNodeType.Group,
        $: { id: 0, name: "", type: "" },
        $$: [objectGroupNode],
      }),
      expectedCount,
      false,
    );

    expect(group.layers).toStrictEqual([{ ...createLayerShared(), type: TMXNodeType.Objectgroup, visible: 1 }]);
  });

  test("fails to parse an unsupported node", () => {
    expect.hasAssertions();

    expect(() =>
      parseNode(
        assertNode<TMXLayerNode>({ "#name": TMXNodeType.Data, $: createLayerShared(), $$: [] }),
        expectedCount,
        false,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "parseNode", TMXNodeType.Data).message}]`,
    );
  });
});
