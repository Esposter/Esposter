import { createLoginHullsGeometry } from "#src/services/login/hull/createLoginHullsGeometry";
import { LOGIN_CAMERA_HEIGHT } from "#src/services/login/scene/constants";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginHullsGeometry, () => {
  // The camera's eye and a metre either side of it, which the glide carries along +z past every bridge and pillar: a
  // Bridge standing too high, or a hull fatter than the part it stands for, drives the camera into stone
  const offsets = [-1, 0, 1];

  test("leaves the camera's path open from end to end", () => {
    expect.hasAssertions();

    const mesh = new Mesh(createLoginHullsGeometry(), new MeshBasicMaterial({ side: DoubleSide }));
    const hits = offsets.flatMap((offset) =>
      new Raycaster(new Vector3(offset, LOGIN_CAMERA_HEIGHT, -1000), new Vector3(0, 0, 1), 0, 2000).intersectObject(
        mesh,
      ),
    );

    expect(hits).toStrictEqual([]);
  });
});
