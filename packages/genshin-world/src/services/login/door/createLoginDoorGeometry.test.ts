import type { LoginDoorPieceGeometry } from "#src/models/login/LoginDoorPieceGeometry";
import type { Object3D } from "three";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import { readLoginData } from "#src/services/login/readLoginData";
import { FrontSide, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { assert, describe, expect, test } from "vitest";

const { door } = await readLoginData(GAME_DATA_LOCAL_BASE_URL);

describe(createLoginDoorGeometry, () => {
  // Only faces turned toward a ray are hit, so a face wound the wrong way round reads as a hole
  const material = new MeshBasicMaterial({ side: FrontSide });
  const [width = 0, height = 0] = door.size;
  // Four fifths of the way out to the door's side, where its jamb stands
  const jambX = (width / 2) * 0.8;
  const castFront = (object: Object3D, x: number): number | undefined =>
    new Raycaster(new Vector3(x, height / 2, 10), new Vector3(0, 0, -1)).intersectObject(object)[0]?.point.z;
  // Every piece's frame, or every piece's panel, where each rests
  const createPart = (part: keyof LoginDoorPieceGeometry): Group =>
    new Group().add(...createLoginDoorGeometry(door).map((piece) => new Mesh(piece[part], material)));

  test("stands the frame round an opening the panel fills, recessed behind the frame's face", () => {
    expect.hasAssertions();

    const frame = createPart("frame");
    const jamb = castFront(frame, jambX);
    assert.exists(jamb);

    expect(castFront(frame, 0)).toBeUndefined();
    expect(castFront(createPart("panel"), 0)).toBeLessThan(jamb);
  });

  test("turns every face outward, its back the front mirrored", () => {
    expect.hasAssertions();

    const frame = createPart("frame");
    const front = castFront(frame, jambX);
    assert.exists(front);
    const back = new Raycaster(new Vector3(jambX, height / 2, -10), new Vector3(0, 0, 1)).intersectObject(frame)[0]
      ?.point.z;

    expect(back).toBeCloseTo(-front);
  });
});
