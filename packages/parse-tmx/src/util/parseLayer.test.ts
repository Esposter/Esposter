import type { TMXImageNode } from "#src/models/tmx/node/TMXImageNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXObjectNode } from "#src/models/tmx/node/TMXObjectNode";

import { Shape } from "#src/models/Shape";
import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { createImageShared } from "#src/test/createImageShared.test";
import { createLayerShared } from "#src/test/createLayerShared.test";
import { createObjectShared } from "#src/test/createObjectShared.test";
import { createPropertiesNode } from "#src/test/createPropertiesNode.test";
import { parseLayer } from "#src/util/parseLayer";
import { describe, expect, test } from "vitest";

describe(parseLayer, () => {
  const name = "name";
  const value = "value";
  const baseNode = { "#name": TMXNodeType.Objectgroup, $: createLayerShared(), $$: [] };

  test("parses the node type as the layer type", () => {
    expect.hasAssertions();

    const layer = parseLayer(assertNode<TMXLayerNode>(baseNode));

    expect(layer.type).toBe(TMXNodeType.Objectgroup);
    expect(layer.visible).toBe(1);
  });

  test("parses objects", () => {
    expect.hasAssertions();

    const object = [assertNode<TMXObjectNode>({ "#name": TMXNodeType.Object, $: createObjectShared(), $$: [] })];
    const layer = parseLayer(assertNode<TMXLayerNode>({ ...baseNode, object }));

    expect(layer.objects).toStrictEqual([{ ...createObjectShared(), shape: Shape.Rectangle }]);
  });

  test("parses properties", () => {
    expect.hasAssertions();

    const properties = createPropertiesNode(name, value);
    const layer = parseLayer(assertNode<TMXLayerNode>({ ...baseNode, properties }));

    expect(layer.properties).toStrictEqual([{ name, value }]);
  });

  test("parses an image", () => {
    expect.hasAssertions();

    const image = [assertNode<TMXImageNode>({ "#name": TMXNodeType.Image, $: createImageShared(), $$: undefined })];
    const layer = parseLayer(assertNode<TMXLayerNode>({ ...baseNode, image }));

    expect(layer.image).toStrictEqual(createImageShared());
  });
});
