import { FOLLOW_CAMERA_DEFAULT_DISTANCE, FOLLOW_CAMERA_EASE_OUT_SPEED } from "#src/camera/constants";
import { createFollowCamera } from "#src/camera/createFollowCamera";
import { createGroundQuery } from "#src/collision/createGroundQuery";
import { createLandmarkCollider } from "#src/collision/createLandmarkCollider";
import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createFollowCamera, () => {
  const WATER_LEVEL = -10;
  const PIVOT_HEIGHT = 10;
  const FRAME_SECONDS = 0.25;
  // A cliff rising behind a camera facing along -z, two metres back from the pivot
  const CLIFF_Z = 2;

  test("stands its eye behind the pivot at its distance", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
    });
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect(camera.position.toArray()).toStrictEqual([0, PIVOT_HEIGHT, FOLLOW_CAMERA_DEFAULT_DISTANCE]);
  });

  test("is pulled in at once by the ground behind and eases back out once it clears", () => {
    expect.hasAssertions();

    let isCliffStanding = true;
    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery((_x, z) => (isCliffStanding && z > CLIFF_Z ? PIVOT_HEIGHT * 2 : 0), WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
    });
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);
    const pulledInZ = camera.position.z;
    isCliffStanding = false;
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect({ easedOutZ: camera.position.z, pulledInZ }).toStrictEqual({
      easedOutZ: CLIFF_Z + FOLLOW_CAMERA_EASE_OUT_SPEED * FRAME_SECONDS,
      pulledInZ: CLIFF_Z,
    });
  });
});
