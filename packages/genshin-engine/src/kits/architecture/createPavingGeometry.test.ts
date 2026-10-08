import { createPavingGeometry } from "#src/kits/architecture/createPavingGeometry";
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createPavingGeometry, () => {
  test("stands each stone where it is placed, with its top facing up and its sides facing out", () => {
    expect.hasAssertions();

    const mesh = new Mesh(
      createPavingGeometry([
        {
          position: [5, 0, 0],
          quaternion: [0, 0, 0, 1],
          scale: [1, 1, 1],
          shape: { bottom: 0, radii: [1, 1, 1, 1], top: 0.2 },
        },
      ]),
      new MeshBasicMaterial(),
    );
    const [topHit] = new Raycaster(new Vector3(5.5, 5, 0.1), new Vector3(0, -1, 0)).intersectObject(mesh);
    const [sideHit] = new Raycaster(new Vector3(8, 0.1, 0.1), new Vector3(-1, 0, 0)).intersectObject(mesh);

    expect(topHit?.point.y).toBeCloseTo(0.2);
    expect(topHit?.face?.normal.y).toBeCloseTo(1);
    expect(sideHit?.point.x).toBeCloseTo(5.9);
    expect(sideHit?.face?.normal.x).toBeGreaterThan(0);
  });
});
