import { orderByViewDepth } from "#src/atmosphere/orderByViewDepth";
import { Matrix4 } from "three";
import { describe, expect, test } from "vitest";

describe(orderByViewDepth, () => {
  // A camera at the origin looking down +z
  const modelViewMatrix = new Matrix4().makeRotationY(Math.PI);

  test("orders by depth along the view, not by distance from the camera", () => {
    expect.hasAssertions();

    const order = Uint32Array.of(1, 0);
    const isReordered = orderByViewDepth(
      [
        [0, 0, 9],
        [8, 0, 6],
      ],
      modelViewMatrix,
      new Float64Array(2),
      order,
    );

    expect({ isReordered, order }).toStrictEqual({ isReordered: true, order: Uint32Array.of(0, 1) });
  });

  test("leaves an order the view already holds, places at one depth by their index", () => {
    expect.hasAssertions();

    const order = Uint32Array.of(0, 1);
    const isReordered = orderByViewDepth(
      [
        [0, 0, 9],
        [0, 8, 9],
      ],
      modelViewMatrix,
      new Float64Array(2),
      order,
    );

    expect({ isReordered, order }).toStrictEqual({ isReordered: false, order: Uint32Array.of(0, 1) });
  });

  test("orders places at one depth by their index", () => {
    expect.hasAssertions();

    const order = Uint32Array.of(1, 0);
    const isReordered = orderByViewDepth(
      [
        [0, 0, 9],
        [0, 8, 9],
      ],
      modelViewMatrix,
      new Float64Array(2),
      order,
    );

    expect({ isReordered, order }).toStrictEqual({ isReordered: true, order: Uint32Array.of(0, 1) });
  });
});
