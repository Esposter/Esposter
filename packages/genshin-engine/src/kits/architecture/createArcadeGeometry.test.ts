import { createArcadeGeometry } from "#src/kits/architecture/createArcadeGeometry";
import { Box3, Mesh, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createArcadeGeometry, () => {
  const bayWidth = 4;
  const height = 6;
  const pierWidth = 1;

  test("runs its bays and end pier along +x, from its foot to its railing's top", () => {
    expect.hasAssertions();

    const geometry = createArcadeGeometry({
      balustrade: { height: 1, postSpacing: 1, thickness: 0.2 },
      bayCount: 2,
      bayWidth,
      depth: 1,
      height,
      pierWidth,
      spandrelHeight: 1,
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    // An extruded shape's points pass through float32, so each extent is its measure to a few millionths
    for (const [actual, expected] of [
      [min, new Vector3(0, 0, -0.5)],
      [max, new Vector3(2 * bayWidth + pierWidth, height + 1, 0.5)],
    ] as const)
      expect(actual.distanceTo(expected)).toBeLessThan(1e-6);
  });

  test("leaves each bay open under its arch and solid over its pier", () => {
    expect.hasAssertions();

    const mesh = new Mesh(
      createArcadeGeometry({ bayCount: 1, bayWidth, depth: 1, height, pierWidth, spandrelHeight: 1 }),
    );
    const raycaster = new Raycaster();
    const direction = new Vector3(0, 0, -1);
    raycaster.set(new Vector3(pierWidth + (bayWidth - pierWidth) / 2, 1, 5), direction);

    expect(raycaster.intersectObject(mesh)).toHaveLength(0);

    raycaster.set(new Vector3(pierWidth / 2, 1, 5), direction);

    expect(raycaster.intersectObject(mesh).length).toBeGreaterThan(0);
  });
});
