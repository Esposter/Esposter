import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { FollowCameraSettings } from "genshin-engine";

// The follow camera's settings as the Settings screen keeps them: the default distance, the two sensitivities and whether
// The pitch follows the slope
export const getFollowCameraSettings = ({
  defaultDistance,
  horizontalSensitivity,
  slopePitch,
  verticalSensitivity,
}: GenshinSettings): FollowCameraSettings => ({
  defaultDistance,
  horizontalSensitivity,
  slopePitch,
  verticalSensitivity,
});
