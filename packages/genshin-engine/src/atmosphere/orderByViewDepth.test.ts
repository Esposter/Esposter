import { orderByViewDepth } from "#src/atmosphere/orderByViewDepth";
import { Matrix4 } from "three";
import { describe, expect, test } from "vitest";

describe(orderByViewDepth, () => {
  test("orders by depth along the view, not by distance from the camera", () => {
    expect.hasAssertions();

    // A camera at the origin looking down +z
    const modelViewMatrix = new Matrix4().makeRotationY(Math.PI);

    expect(
      orderByViewDepth(
        [
          [0, 0, 9],
          [8, 0, 6],
        ],
        modelViewMatrix,
      ),
    ).toStrictEqual([0, 1]);
  });
});
