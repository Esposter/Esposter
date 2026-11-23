import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createLoginHullsGeometry } from "#src/services/login/hull/createLoginHullsGeometry";
import { readLoginData } from "#src/services/login/readLoginData";
import { computeLoginCameraHeight } from "#src/services/login/scene/computeLoginCameraHeight";
import { LOGIN_TOWERS_ROW_OFFSET } from "#src/services/login/scene/constants";
import { computeLoginTowerAtlas } from "#src/services/login/tower/computeLoginTowerAtlas";
import { createLoginTowersGeometry } from "#src/services/login/tower/createLoginTowersGeometry";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { DoubleSide, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, test } from "vitest";

const { hulls, towers, walkway } = await readLoginData(GAME_DATA_LOCAL_BASE_URL);

const buildRow = (): Group => {
  const material = new MeshBasicMaterial({ side: DoubleSide });
  const row = new Group().add(
    new Mesh(createLoginHullsGeometry(hulls), material),
    new Mesh(createLoginTowersGeometry(towers, computeLoginTowerAtlas(towers)), material),
  );
  row.position.set(...LOGIN_TOWERS_ROW_OFFSET);
  row.updateMatrixWorld();
  return row;
};

describe(createLoginHullsGeometry, () => {
  const offsets = [-1, 0, 1];
  const castPath = (row: Group) =>
    offsets.flatMap((offset) =>
      new Raycaster(
        new Vector3(offset, computeLoginCameraHeight(walkway), -1000),
        new Vector3(0, 0, 1),
        0,
        2000,
      ).intersectObject(row),
    );

  test("the row built against the row built and its path cast", async ({ bench }) => {
    await bench.compare(
      bench("build the row", () => {
        buildRow();
      }),
      bench("build the row and cast the path", () => {
        castPath(buildRow());
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
