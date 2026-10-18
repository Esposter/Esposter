import type { InputState } from "genshin-engine";

import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { getFollowCameraSettings } from "#src/services/menu/getFollowCameraSettings";
import {
  createFollowCamera,
  createGroundQuery,
  createLandmarkCollider,
  FOLLOW_CAMERA_NEUTRAL_SENSITIVITY,
} from "genshin-engine";
import { PerspectiveCamera } from "three";
import { describe, expect, test } from "vitest";

describe(getFollowCameraSettings, () => {
  const WATER_LEVEL = -10;
  const LOOK_YAW = 0.5;
  const SET_HORIZONTAL_SENSITIVITY = 5;
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

  test("the sensitivity and distance a player sets reach the follow camera", () => {
    expect.hasAssertions();

    expect(
      getFollowCameraSettings({
        ...GENSHIN_SETTINGS_DEFAULTS,
        defaultDistance: 5.5,
        horizontalSensitivity: 2,
        slopePitch: true,
        verticalSensitivity: 4,
      }),
    ).toStrictEqual({ defaultDistance: 5.5, horizontalSensitivity: 2, slopePitch: true, verticalSensitivity: 4 });
  });

  test("sensitivity from Settings sets the turn speed", () => {
    expect.hasAssertions();

    const followCamera = createFollowCamera({
      camera: new PerspectiveCamera(),
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      settings: getFollowCameraSettings({
        ...GENSHIN_SETTINGS_DEFAULTS,
        horizontalSensitivity: SET_HORIZONTAL_SENSITIVITY,
      }),
    });
    followCamera.look({ ...STILL_INPUT, lookYaw: LOOK_YAW }, 0);

    expect(followCamera.yaw).toBeCloseTo(LOOK_YAW * (SET_HORIZONTAL_SENSITIVITY / FOLLOW_CAMERA_NEUTRAL_SENSITIVITY));
  });
});
