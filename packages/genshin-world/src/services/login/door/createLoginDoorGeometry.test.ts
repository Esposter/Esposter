import door from "#src/data/login/door.json";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginDoorGeometry, () => {
  test("stands the frame round an opening the panel fills, recessed behind the frame's face", () => {
    expect.hasAssertions();

    const { frame, panel } = createLoginDoorGeometry();
    const material = new MeshBasicMaterial({ side: DoubleSide });
    const [, height = 0] = door.size;
    // Straight through the door's middle, halfway up, from in front of it
    const ray = new Raycaster(new Vector3(0, height / 2, 10), new Vector3(0, 0, -1));
    panel.computeBoundingBox();
    const panelBox = panel.boundingBox ?? new Box3();

    expect(ray.intersectObject(new Mesh(frame, material))).toStrictEqual([]);
    expect(ray.intersectObject(new Mesh(panel, material))[0]?.point.z).toBeCloseTo(panelBox.max.z);
    expect(panelBox.max.z).toBeLessThan(door.frame.depth[1] ?? 0);
  });
});
