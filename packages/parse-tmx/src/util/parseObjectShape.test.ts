import type { TMXObjectNode } from "#src/models/tmx/node/TMXObjectNode";

import { Shape } from "#src/models/Shape";
import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { createObjectShared } from "#src/test/createObjectShared.test";
import { parseObjectShape } from "#src/util/parseObjectShape";
import { describe, expect, test } from "vitest";

describe(parseObjectShape, () => {
  const baseNode = { "#name": TMXNodeType.Object, $: createObjectShared(), $$: [] };

  test(Shape.Rectangle, () => {
    expect.hasAssertions();

    expect(parseObjectShape(assertNode<TMXObjectNode>(baseNode))).toBe(Shape.Rectangle);
  });

  test(Shape.Point, () => {
    expect.hasAssertions();

    expect(parseObjectShape(assertNode<TMXObjectNode>({ ...baseNode, point: undefined }))).toBe(Shape.Point);
  });

  test(Shape.Ellipse, () => {
    expect.hasAssertions();

    expect(parseObjectShape(assertNode<TMXObjectNode>({ ...baseNode, ellipse: undefined }))).toBe(Shape.Ellipse);
  });

  test(Shape.Polygon, () => {
    expect.hasAssertions();

    expect(parseObjectShape(assertNode<TMXObjectNode>({ ...baseNode, polygon: undefined }))).toBe(Shape.Polygon);
  });
});
