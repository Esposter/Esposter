import { createLoginHullsGeometry } from "#src/services/login/hull/createLoginHullsGeometry";
import { LOGIN_CAMERA_HEIGHT } from "#src/services/login/scene/constants";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginHullsGeometry, () => {
  // The camera's path, which the exports leave open from end to end (genshin:assets clearance login): a hull fatter
  // Than the part it stands for, or a row placed too high, would carry a bridge through the camera as the world glides
  test("leaves the camera's path open from end to end", () => {
    expect.hasAssertions();

    const mesh = new Mesh(createLoginHullsGeometry(), new MeshBasicMaterial({ side: DoubleSide }));
    const hits = new Raycaster(
      new Vector3(0, LOGIN_CAMERA_HEIGHT, -1000),
      new Vector3(0, 0, 1),
      0,
      2000,
    ).intersectObject(mesh);

    expect(hits).toStrictEqual([]);
  });
});
