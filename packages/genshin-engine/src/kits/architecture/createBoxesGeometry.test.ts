import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createBoxesGeometry, () => {
  test("stands each box where it is given and leaves the space between them open", () => {
    expect.hasAssertions();

    const mesh = new Mesh(
      createBoxesGeometry([
        [0, 0, 0, 1, 3, 2],
        [3, 0, 0, 4, 3, 2],
      ]),
      new MeshBasicMaterial(),
    );
    const castDown = (x: number): number[] =>
      new Raycaster(new Vector3(x, 5, 0.7), new Vector3(0, -1, 0))
        .intersectObject(mesh)
        .map(({ point }) => Math.round(point.y));

    expect(castDown(0.5)).toStrictEqual([3]);
    expect(castDown(2)).toStrictEqual([]);
  });
});
