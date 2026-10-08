import type { InputState } from "#src/models/input/InputState";

import { FREE_CAMERA_BASE_SPEED, FREE_CAMERA_CLEARANCE, FREE_CAMERA_SPEED_PER_HEIGHT } from "#src/camera/constants";
import { createFreeCamera } from "#src/camera/createFreeCamera";
import { createGroundQuery } from "#src/collision/createGroundQuery";
import { Euler, PerspectiveCamera, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createFreeCamera, () => {
  const WATER_LEVEL = 0;
  const HEIGHT = 10;
  const STEP_SECONDS = 1;
  const STILL_INPUT: InputState = {
    heldActions: new Set(),
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    pressedActions: new Set(),
  };
  const FORWARD_INPUT: InputState = { ...STILL_INPUT, moveForward: 1 };

  test("flies along the view faster the higher it is above the ground", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    camera.position.set(0, HEIGHT, 0);
    createFreeCamera({ camera, ground: createGroundQuery(() => 0, WATER_LEVEL) }).step(FORWARD_INPUT, STEP_SECONDS);

    expect(camera.position.z).toBeCloseTo(-(FREE_CAMERA_BASE_SPEED + HEIGHT * FREE_CAMERA_SPEED_PER_HEIGHT), 9);
  });

  test("is held above the ground at its clearance", () => {
    expect.hasAssertions();

    const camera = new PerspectiveCamera();
    camera.position.set(0, 0, 0);
    createFreeCamera({ camera, ground: createGroundQuery(() => 0, WATER_LEVEL) }).step(STILL_INPUT, STEP_SECONDS);

    expect(camera.position.toArray()).toStrictEqual(new Vector3(0, FREE_CAMERA_CLEARANCE, 0).toArray());
  });

  test("is held above the water's surface where the water lies above the ground", () => {
    expect.hasAssertions();

    const WATER_SURFACE = 4;
    const camera = new PerspectiveCamera();
    camera.position.set(0, 0, 0);
    createFreeCamera({ camera, ground: createGroundQuery(() => 0, WATER_SURFACE) }).step(STILL_INPUT, STEP_SECONDS);

    expect(camera.position.y).toBe(WATER_SURFACE + FREE_CAMERA_CLEARANCE);
  });

  test("turns a look from the view a place set, never the one before it", () => {
    expect.hasAssertions();

    const LOOK_YAW = 1;
    const PLACED_YAW = 2;
    const camera = new PerspectiveCamera();
    const freeCamera = createFreeCamera({ camera, ground: createGroundQuery(() => 0, WATER_LEVEL) });
    freeCamera.look({ ...STILL_INPUT, lookYaw: LOOK_YAW });
    freeCamera.place(new Vector3(HEIGHT, HEIGHT, HEIGHT), PLACED_YAW, 0);
    freeCamera.look({ ...STILL_INPUT, lookYaw: LOOK_YAW });
    const { y: yaw } = new Euler().setFromQuaternion(camera.quaternion, "YXZ");

    expect({ position: camera.position.toArray(), yaw }).toStrictEqual({
      position: [HEIGHT, HEIGHT, HEIGHT],
      yaw: expect.closeTo(PLACED_YAW + LOOK_YAW, 9),
    });
  });
});
