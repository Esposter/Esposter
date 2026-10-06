import door from "#src/data/login/door.json";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import { FrontSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginDoorGeometry, () => {
  // Only faces turned toward a ray are hit, so a face wound the wrong way round reads as a hole
  const material = new MeshBasicMaterial({ side: FrontSide });
  const [width = 0, height = 0] = door.size;
  // Four fifths of the way out to the door's side, where its jamb stands
  const jambX = (width / 2) * 0.8;
  const castFront = (mesh: Mesh, x: number): number | undefined =>
    new Raycaster(new Vector3(x, height / 2, 10), new Vector3(0, 0, -1)).intersectObject(mesh)[0]?.point.z;

  test("stands the frame round an opening the panel fills, recessed behind the frame's face", () => {
    expect.hasAssertions();

    const { frame, panel } = createLoginDoorGeometry();
    const frameMesh = new Mesh(frame, material);

    expect(castFront(frameMesh, 0)).toBeUndefined();
    expect(castFront(new Mesh(panel, material), 0)).toBeLessThan(castFront(frameMesh, jambX) ?? 0);
  });

  test("turns every face outward, its back the front mirrored", () => {
    expect.hasAssertions();

    const mesh = new Mesh(createLoginDoorGeometry().frame, material);
    const front = castFront(mesh, jambX) ?? 0;
    const back = new Raycaster(new Vector3(jambX, height / 2, -10), new Vector3(0, 0, 1)).intersectObject(mesh)[0]
      ?.point.z;

    expect(back).toBeCloseTo(-front);
  });
});
