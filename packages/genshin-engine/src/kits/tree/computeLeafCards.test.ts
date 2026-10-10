import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { LEAF_SHAPE_KEPT_SHARE } from "#src/nodes/constants";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeLeafCards, () => {
  const leafOptions = { cardSize: 1, leafAreaScale: 1, seed: 0 };
  // The leaf one card of the options keeps
  const cardKeptArea = 4 * LEAF_SHAPE_KEPT_SHARE;
  const cluster = { leafArea: cardKeptArea, radius: 1, x: 0, y: 0, z: 0 };
  const clusters = [cluster];
  // Positions and normals are each rounded to single precision on their own, so they agree to that precision
  const precision = 1e-6;

  test("points every normal out from its cluster's centre", () => {
    expect.hasAssertions();

    const { normals, positions } = computeLeafCards(clusters, leafOptions);
    const deviations = Array.from({ length: positions.length / 3 }, (_value, vertex) => {
      const direction = new Vector3().fromArray(positions, vertex * 3).normalize();
      const normal = new Vector3().fromArray(normals, vertex * 3);
      return direction.distanceTo(normal);
    });

    expect(Math.max(...deviations)).toBeLessThan(precision);
  });

  test("builds each card as two triangles over four corners", () => {
    expect.hasAssertions();

    const { indices, uvs } = computeLeafCards(clusters, leafOptions);

    expect(indices).toStrictEqual(Uint32Array.from([0, 1, 2, 0, 2, 3]));
    expect(uvs).toStrictEqual(Float32Array.from([0, 0, 1, 0, 1, 1, 0, 1]));
  });

  test("grows each cluster as many cards as keep its leaf area times the scale", () => {
    expect.hasAssertions();

    const { indices } = computeLeafCards([{ ...cluster, leafArea: 3 * cardKeptArea }], {
      ...leafOptions,
      leafAreaScale: 2,
    });

    expect(indices).toHaveLength(6 * 6);
  });
});
