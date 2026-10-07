import { LOGIN_CAMERA_DESIGN_ASPECT, LOGIN_CAMERA_FOV } from "#src/services/login/scene/constants";
import { getLoginCameraFov } from "#src/services/login/scene/getLoginCameraFov";
import { describe, expect, test } from "vitest";

describe(getLoginCameraFov, () => {
  test("holds LoginCamera's field of view from the design aspect outward", () => {
    expect.hasAssertions();

    expect(getLoginCameraFov(LOGIN_CAMERA_DESIGN_ASPECT)).toBe(LOGIN_CAMERA_FOV);
    expect(getLoginCameraFov(3440 / 1440)).toBe(LOGIN_CAMERA_FOV);
  });

  test("widens on a narrower screen to the 51.2 degrees the 16:9 recordings read", () => {
    expect.hasAssertions();

    expect(getLoginCameraFov(16 / 9)).toBeCloseTo(51.2, 1);
  });
});
