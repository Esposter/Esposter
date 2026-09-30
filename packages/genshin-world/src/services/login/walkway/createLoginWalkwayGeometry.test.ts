import { LOGIN_DAIS, LOGIN_DOOR_Z } from "#src/services/login/door/constants";
import {
  LOGIN_FIRST_WING_CENTRE,
  LOGIN_SEGMENT_LENGTH,
  LOGIN_WALKWAY_START,
  LOGIN_WALKWAY_WIDTH,
  LOGIN_WING,
} from "#src/services/login/walkway/constants";
import { createLoginWalkwayGeometry } from "#src/services/login/walkway/createLoginWalkwayGeometry";
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginWalkwayGeometry, () => {
  const mesh = new Mesh(createLoginWalkwayGeometry(), new MeshBasicMaterial({ side: DoubleSide }));
  const raycaster = new Raycaster();
  const down = new Vector3(0, -1, 0);
  const hitsAt = (x: number, z: number): boolean => {
    raycaster.set(new Vector3(x, 10, z), down);
    return raycaster.intersectObject(mesh).length > 0;
  };

  test("runs from behind the camera to the door's dais", () => {
    expect.hasAssertions();

    mesh.geometry.computeBoundingBox();
    const { max, min } = mesh.geometry.boundingBox ?? new Box3();

    expect(max.z).toBeCloseTo(LOGIN_WALKWAY_START);
    expect(min.z).toBeCloseTo(LOGIN_DOOR_Z - LOGIN_DAIS.length / 2);
    expect(max.y).toBeCloseTo(LOGIN_DAIS.height);
  });

  test("crosses the walkway with wings at each segment, and nothing beside it between them", () => {
    expect.hasAssertions();

    const besideWalkway = LOGIN_WALKWAY_WIDTH / 2 + LOGIN_WING.overhang / 2;

    expect(hitsAt(besideWalkway, LOGIN_FIRST_WING_CENTRE)).toBe(true);
    expect(hitsAt(-besideWalkway, LOGIN_FIRST_WING_CENTRE - LOGIN_SEGMENT_LENGTH)).toBe(true);
    expect(hitsAt(besideWalkway, LOGIN_FIRST_WING_CENTRE - LOGIN_SEGMENT_LENGTH / 2)).toBe(false);
  });
});
