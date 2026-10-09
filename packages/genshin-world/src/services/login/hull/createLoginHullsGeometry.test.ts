import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createLoginHullsGeometry } from "#src/services/login/hull/createLoginHullsGeometry";
import { readLoginData } from "#src/services/login/readLoginData";
import { computeLoginCameraHeight } from "#src/services/login/scene/computeLoginCameraHeight";
import { LOGIN_TOWERS_ROW_OFFSET } from "#src/services/login/scene/constants";
import { computeLoginTowerAtlas } from "#src/services/login/tower/computeLoginTowerAtlas";
import { createLoginTowersGeometry } from "#src/services/login/tower/createLoginTowersGeometry";
import { DoubleSide, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

const { hulls, towers, walkway } = await readLoginData(GAME_DATA_LOCAL_BASE_URL);

describe(createLoginHullsGeometry, () => {
  // The camera's eye and a metre either side of it, which the glide carries along +z past every tower, bridge and
  // Pillar of the row as it stands off its laid-out place: a bridge standing too high, a row standing across the path,
  // Or a hull fatter than the part it stands for, drives the camera into stone
  const offsets = [-1, 0, 1];

  test("leaves the camera's path open from end to end", () => {
    expect.hasAssertions();

    const material = new MeshBasicMaterial({ side: DoubleSide });
    const row = new Group().add(
      new Mesh(createLoginHullsGeometry(hulls), material),
      new Mesh(createLoginTowersGeometry(towers, computeLoginTowerAtlas(towers)), material),
    );
    row.position.set(...LOGIN_TOWERS_ROW_OFFSET);
    row.updateMatrixWorld();
    const hits = offsets.flatMap((offset) =>
      new Raycaster(
        new Vector3(offset, computeLoginCameraHeight(walkway), -1000),
        new Vector3(0, 0, 1),
        0,
        2000,
      ).intersectObject(row),
    );

    expect(hits).toStrictEqual([]);
  });
});
