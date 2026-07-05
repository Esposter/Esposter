import type { TMXObjectNode } from "@/models/tmx/node/TMXObjectNode";

import { Shape } from "@/models/Shape";
import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import { assertNode } from "@/test/assertNode.test";
import { parseObjectShape } from "@/util/parseObjectShape";
import { describe, expect, test } from "vitest";

describe(parseObjectShape, () => {
  const baseNode = {
    "#name": TMXNodeType.Object,
    $: {
      gid: 0,
      height: 0,
      id: 0,
      type: "",
      width: 0,
      x: 0,
      y: 0,
    },
    $$: [],
  };

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
