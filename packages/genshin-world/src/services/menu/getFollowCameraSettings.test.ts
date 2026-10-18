import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { getFollowCameraSettings } from "#src/services/menu/getFollowCameraSettings";
import { describe, expect, test } from "vitest";

describe(getFollowCameraSettings, () => {
  test("the sensitivity and distance a player sets reach the follow camera", () => {
    expect.hasAssertions();

    expect(
      getFollowCameraSettings({
        ...GENSHIN_SETTINGS_DEFAULTS,
        defaultDistance: 5.5,
        horizontalSensitivity: 2,
        verticalSensitivity: 4,
      }),
    ).toStrictEqual({ defaultDistance: 5.5, horizontalSensitivity: 2, verticalSensitivity: 4 });
  });
});
