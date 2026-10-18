import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { FollowCameraSettings } from "genshin-engine";

// The follow camera's settings as the Settings screen keeps them: the default distance and the two sensitivities
export const getFollowCameraSettings = ({
  defaultDistance,
  horizontalSensitivity,
  verticalSensitivity,
}: GenshinSettings): FollowCameraSettings => ({ defaultDistance, horizontalSensitivity, verticalSensitivity });
