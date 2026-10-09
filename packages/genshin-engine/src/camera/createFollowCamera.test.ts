import type { InputState } from "#src/models/input/InputState";

import { FOLLOW_CAMERA_DEFAULT_SETTINGS, FOLLOW_CAMERA_EASE_OUT_SPEED } from "#src/camera/constants";
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
  const LOOK_YAW = 3;
  const ZOOM_OUT_STEPS = 2;
  const DEFAULT_DISTANCE = 4.5;
  const STILL_INPUT: InputState = {
    heldActions: new Set(),
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    pressedActions: new Set(),
    zoomSteps: 0,
  };

  const lookYawAt = (horizontalSensitivity: number): number => {
    const followCamera = createFollowCamera({
      camera: new PerspectiveCamera(),
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: { ...FOLLOW_CAMERA_DEFAULT_SETTINGS, horizontalSensitivity },
    });
    followCamera.look({ ...STILL_INPUT, lookYaw: LOOK_YAW }, 0);
    return followCamera.yaw;
  };

  test("stands its eye behind the pivot at its settings' default distance", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: FOLLOW_CAMERA_DEFAULT_SETTINGS,
    });
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect(camera.position.toArray()).toStrictEqual([0, PIVOT_HEIGHT, FOLLOW_CAMERA_DEFAULT_SETTINGS.defaultDistance]);
  });

  test("is pulled in at once by the ground behind and eases back out once it clears", () => {
    expect.hasAssertions();

    let isCliffStanding = true;
    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery((_x, z) => (isCliffStanding && z > CLIFF_Z ? PIVOT_HEIGHT * 2 : 0), WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: FOLLOW_CAMERA_DEFAULT_SETTINGS,
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

  test("turns its look in proportion to its horizontal sensitivity", () => {
    expect.hasAssertions();

    expect(lookYawAt(5) / lookYawAt(3)).toBeCloseTo(5 / 3);
  });

  test("resets its eye to the settings' default distance after a zoom", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: { ...FOLLOW_CAMERA_DEFAULT_SETTINGS, defaultDistance: DEFAULT_DISTANCE },
    });
    followCamera.look({ ...STILL_INPUT, zoomSteps: ZOOM_OUT_STEPS }, 0);
    followCamera.reset(0);
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect(camera.position.z).toBeCloseTo(DEFAULT_DISTANCE);
  });
});
