import type { InputState } from "#src/models/input/InputState";

import { FREE_CAMERA_BASE_SPEED, FREE_CAMERA_CLEARANCE, FREE_CAMERA_SPEED_PER_HEIGHT } from "#src/camera/constants";
import { createFreeCamera } from "#src/camera/createFreeCamera";
import { createGroundQuery } from "#src/collision/createGroundQuery";
import { createIdleInputState } from "#src/input/createIdleInputState";
import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createFreeCamera, () => {
  const WATER_LEVEL = 0;
  const HEIGHT = 10;
  const STEP_SECONDS = 1;
  const STILL_INPUT: InputState = createIdleInputState();
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
});
