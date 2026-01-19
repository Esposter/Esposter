import type { TMXObjectNode } from "@/models/tmx/node/TMXObjectNode";

import { Shape } from "@/models/Shape";
import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import { parseObjectShape } from "@/util/parseObjectShape";
import { assertNode } from "@/util/test/assertNode";
import { describe, expect, test } from "vitest";

describe(parseObjectShape, () => {
  test(Shape.Rectangle, () => {
    expect.hasAssertions();

    expect(
      parseObjectShape(
        assertNode<TMXObjectNode>({
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
        }),
      ),
    ).toBe(Shape.Rectangle);
  });

  test(Shape.Point, () => {
    expect.hasAssertions();

    expect(
      parseObjectShape(
        assertNode<TMXObjectNode>({
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
          point: undefined,
        }),
      ),
    ).toBe(Shape.Point);
  });

  test(Shape.Ellipse, () => {
    expect.hasAssertions();

    expect(
      parseObjectShape(
        assertNode<TMXObjectNode>({
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
          ellipse: undefined,
        }),
      ),
    ).toBe(Shape.Ellipse);
  });

  test(Shape.Polygon, () => {
    expect.hasAssertions();

    expect(
      parseObjectShape(
        assertNode<TMXObjectNode>({
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
          polygon: undefined,
        }),
      ),
    ).toBe(Shape.Polygon);
  });
});
