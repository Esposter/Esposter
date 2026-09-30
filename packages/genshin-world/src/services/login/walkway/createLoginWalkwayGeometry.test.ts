import walkway from "#src/data/login/walkway.json";
import { createLoginWalkwayGeometry } from "#src/services/login/walkway/createLoginWalkwayGeometry";
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginWalkwayGeometry, () => {
  const mesh = new Mesh(createLoginWalkwayGeometry(), new MeshBasicMaterial({ side: DoubleSide }));
  const xs = walkway.outline.map(([x = 0]) => x);
  const zs = walkway.outline.map(([, z = 0]) => z);

  test("spans its outline from its underside to its surface", () => {
    expect.hasAssertions();

    mesh.geometry.computeBoundingBox();
    const { max, min } = mesh.geometry.boundingBox ?? new Box3();

    expect(min.y).toBeCloseTo(walkway.bottom);
    expect(max.y).toBeCloseTo(walkway.top);
    expect(max.x).toBeCloseTo(Math.max(...xs));
    expect(min.z).toBeCloseTo(Math.min(...zs));
  });

  test("stands under every corner of its outline and nowhere past its widest", () => {
    expect.hasAssertions();

    const raycaster = new Raycaster();
    const down = new Vector3(0, -1, 0);
    const [x = 0, z = 0] = walkway.outline[0] ?? [];
    raycaster.set(new Vector3(x * 0.99, walkway.top + 1, z * 0.99), down);

    expect(raycaster.intersectObject(mesh).length).toBeGreaterThan(0);

    raycaster.set(new Vector3(Math.max(...xs) + 1, walkway.top + 1, 0), down);

    expect(raycaster.intersectObject(mesh)).toHaveLength(0);
  });
});
