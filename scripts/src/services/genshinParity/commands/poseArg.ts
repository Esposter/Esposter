import type { StringArgDef } from "citty";

import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";

// A camera pose in place of a reference's, as the commands that render a reference at one take it
export const poseArg: StringArgDef = {
  description: `A pose in place of the reference's, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
  type: "string",
};
