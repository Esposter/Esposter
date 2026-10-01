import { createLoginHullsGeometry } from "#src/services/login/hull/createLoginHullsGeometry";
import { LOGIN_CAMERA_HEIGHT } from "#src/services/login/scene/constants";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginHullsGeometry, () => {
  // The one stretch of the camera's path the exports' own bridges stand across (genshin:assets clearance login): a
  // Pier of LoginScene_Bridge04's 0.4 metres deep, which the game's glide passes once a loop too
  const exportsPierced: [number, number] = [57.17, 57.55];
  // Two of the hull's tenth-of-a-metre cells, which it errs solid by: a cell's rounding and the edge it covers
  const tolerance = 0.2;

  // A hull fatter than the part it stands for, its arches or the space under its deck filled, would carry a bridge
  // Through the camera wherever the game's leaves the way open
  test("leaves the camera's path open wherever the exports do", () => {
    expect.hasAssertions();

    const mesh = new Mesh(createLoginHullsGeometry(), new MeshBasicMaterial({ side: DoubleSide }));
    const depths = new Raycaster(new Vector3(0, LOGIN_CAMERA_HEIGHT, -1000), new Vector3(0, 0, 1), 0, 2000)
      .intersectObject(mesh)
      .map(({ point }) => point.z);
    const [start, end] = exportsPierced;

    expect(depths.filter((depth) => depth < start - tolerance || depth > end + tolerance)).toStrictEqual([]);
  });
});
