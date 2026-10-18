import type { InputState } from "#src/models/input/InputState";

import {
  FOLLOW_CAMERA_CLEARANCE,
  FOLLOW_CAMERA_DEFAULT_SETTINGS,
  FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP,
  FOLLOW_CAMERA_EASE_OUT_SPEED,
  FOLLOW_CAMERA_MAX_DISTANCE,
  FOLLOW_CAMERA_MAX_PITCH,
  FOLLOW_CAMERA_MIN_DISTANCE,
} from "#src/camera/constants";
import { createFollowCamera } from "#src/camera/createFollowCamera";
import { createGroundQuery } from "#src/collision/createGroundQuery";
import { createLandmarkCollider } from "#src/collision/createLandmarkCollider";
import { Euler, PerspectiveCamera, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createFollowCamera, () => {
  const WATER_LEVEL = -10;
  const PIVOT_HEIGHT = 10;
  const FRAME_SECONDS = 0.25;
  // A cliff rising behind a camera facing along -z, two metres back from the pivot
  const CLIFF_Z = 2;
  const LOOK_YAW = 3;
  const ZOOM_OUT_STEPS = 2;
  // Notches enough to pass both the nearest and the furthest distance from the default
  const STEPS_PAST_LIMIT = 20;
  // Frames enough for the eye to ease across the whole range, which it does a metre a frame at the ease's rate
  const FRAMES_TO_SETTLE = 20;
  const DEFAULT_DISTANCE = 4.5;
  // A pivot low enough that a look up from below puts the arm's reach under the ground
  const LOW_PIVOT_HEIGHT = 0.5;
  const LOOK_PAST_LIMIT = 10;
  // A ground rising one metre for every two along the eye's side, and enough frames for the pitch to settle on it
  const SLOPE_RISE_PER_METRE = 0.5;
  const SLOPE_FRAMES = 60;
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

  test("looks up from below no higher than its pitch limit, so the arm stays out in front of the pivot", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: { ...FOLLOW_CAMERA_DEFAULT_SETTINGS, defaultDistance: DEFAULT_DISTANCE },
    });
    followCamera.look({ ...STILL_INPUT, lookPitch: LOOK_PAST_LIMIT }, 0);
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect(camera.position.y).toBeCloseTo(PIVOT_HEIGHT - Math.sin(FOLLOW_CAMERA_MAX_PITCH) * DEFAULT_DISTANCE);
  });

  test("drops its eye to the ground's clearance rather than the minimum distance when the ground stands under the arm", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const pivot = new Vector3(0, LOW_PIVOT_HEIGHT, 0);
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: FOLLOW_CAMERA_DEFAULT_SETTINGS,
    });
    followCamera.look({ ...STILL_INPUT, lookPitch: LOOK_PAST_LIMIT }, 0);
    followCamera.follow(pivot, new Vector3(), FRAME_SECONDS);

    expect({
      isAboveGround: camera.position.y >= FOLLOW_CAMERA_CLEARANCE,
      isNearerThanMinimum: camera.position.distanceTo(pivot) < FOLLOW_CAMERA_MIN_DISTANCE,
    }).toStrictEqual({ isAboveGround: true, isNearerThanMinimum: true });
  });

  test("starts level, whatever pose the camera it takes over was looking at", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    camera.quaternion.setFromEuler(new Euler(Math.PI / 2, 0, 0, "YXZ"));
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: FOLLOW_CAMERA_DEFAULT_SETTINGS,
    });
    followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect(camera.position.y).toBeCloseTo(PIVOT_HEIGHT);
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

  test("the wheel stops at the nearest and furthest distances", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const pivot = new Vector3(0, PIVOT_HEIGHT, 0);
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: FOLLOW_CAMERA_DEFAULT_SETTINGS,
    });
    // Turns the wheel by the notches given, lets the eye ease to its new distance, and returns it from the pivot
    const distanceAfterTurning = (zoomSteps: number): number => {
      followCamera.look({ ...STILL_INPUT, zoomSteps }, 0);
      for (let frame = 0; frame < FRAMES_TO_SETTLE; frame++) followCamera.follow(pivot, new Vector3(), FRAME_SECONDS);
      return camera.position.distanceTo(pivot);
    };

    expect(distanceAfterTurning(-STEPS_PAST_LIMIT)).toBeCloseTo(FOLLOW_CAMERA_MIN_DISTANCE);
    expect(distanceAfterTurning(-1)).toBeCloseTo(FOLLOW_CAMERA_MIN_DISTANCE);
    expect(distanceAfterTurning(1)).toBeCloseTo(FOLLOW_CAMERA_MIN_DISTANCE + FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP);
    expect(distanceAfterTurning(STEPS_PAST_LIMIT)).toBeCloseTo(FOLLOW_CAMERA_MAX_DISTANCE);
    expect(distanceAfterTurning(1)).toBeCloseTo(FOLLOW_CAMERA_MAX_DISTANCE);
    expect(distanceAfterTurning(-1)).toBeCloseTo(FOLLOW_CAMERA_MAX_DISTANCE - FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP);
  });

  test("zoom, combat or a teleport returns the camera to its default distance", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const pivot = new Vector3(0, PIVOT_HEIGHT, 0);
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: { ...FOLLOW_CAMERA_DEFAULT_SETTINGS, defaultDistance: DEFAULT_DISTANCE },
    });
    followCamera.look({ ...STILL_INPUT, lookYaw: LOOK_YAW, zoomSteps: ZOOM_OUT_STEPS }, 0);
    const yaw = followCamera.yaw;
    followCamera.returnToDefaultDistance();
    followCamera.follow(pivot, new Vector3(), FRAME_SECONDS);

    expect(followCamera.yaw).toBe(yaw);
    expect(camera.position.distanceTo(pivot)).toBeCloseTo(DEFAULT_DISTANCE);
  });

  test("pitch follows the slope when enabled", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery((_x, z) => z * SLOPE_RISE_PER_METRE, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: { ...FOLLOW_CAMERA_DEFAULT_SETTINGS, slopePitch: true },
    });
    for (let frame = 0; frame < SLOPE_FRAMES; frame++)
      followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    // The eye sits on the arm that runs parallel to the ground rising behind it, so the pitch looks up along that slope
    expect(new Euler().setFromQuaternion(camera.quaternion, "YXZ").x).toBeCloseTo(-Math.atan(SLOPE_RISE_PER_METRE));
  });

  test("pitch stays level when disabled", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    const followCamera = createFollowCamera({
      camera,
      ground: createGroundQuery((_x, z) => z * SLOPE_RISE_PER_METRE, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: { ...FOLLOW_CAMERA_DEFAULT_SETTINGS, slopePitch: false },
    });
    for (let frame = 0; frame < SLOPE_FRAMES; frame++)
      followCamera.follow(new Vector3(0, PIVOT_HEIGHT, 0), new Vector3(), FRAME_SECONDS);

    expect(camera.position.toArray()).toStrictEqual([0, PIVOT_HEIGHT, FOLLOW_CAMERA_DEFAULT_SETTINGS.defaultDistance]);
  });
});
