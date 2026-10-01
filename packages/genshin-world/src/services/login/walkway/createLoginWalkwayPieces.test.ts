import walkway from "#src/data/login/walkway.json";
import { createLoginWalkwayPieces } from "#src/services/login/walkway/createLoginWalkwayPieces";
import { Box3, DoubleSide, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginWalkwayPieces, () => {
  const pieces = createLoginWalkwayPieces();
  const group = new Group().add(
    ...pieces.map(({ geometry }) => new Mesh(geometry, new MeshBasicMaterial({ side: DoubleSide }))),
  );

  test("lays the walkway from its underside to its surface, each piece about its own middle", () => {
    expect.hasAssertions();

    const { max, min } = new Box3().setFromObject(group);

    expect(min.y).toBeCloseTo(walkway.bottom);
    expect(max.y).toBeCloseTo(Math.max(...walkway.pieces.map(({ top }) => top)));
    for (const { depth, geometry } of pieces) {
      geometry.computeBoundingBox();
      const { max: pieceMax, min: pieceMin } = geometry.boundingBox ?? new Box3();

      expect((pieceMin.z + pieceMax.z) / 2).toBeCloseTo(depth);
    }
  });

  test("stands under its middle and nowhere past its widest", () => {
    expect.hasAssertions();

    const raycaster = new Raycaster();
    const down = new Vector3(0, -1, 0);
    raycaster.set(new Vector3(0, walkway.top + 1, 0), down);

    expect(raycaster.intersectObject(group).length).toBeGreaterThan(0);

    const xs = walkway.pieces.flatMap(({ outline }) => outline.map(([x = 0]) => x));
    raycaster.set(new Vector3(Math.max(...xs) + 1, walkway.top + 1, 0), down);

    expect(raycaster.intersectObject(group)).toHaveLength(0);
  });
});
