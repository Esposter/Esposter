import type { PageWitnessView } from "#src/models/genshinParity/shared/PageWitnessView";

import { MathUtils } from "three";

// A pose along `CAMERA_POSE_AXES` (metres, then degrees) as the parity page's witness camera takes it, in radians but
// For its field of view
export const toPageCamera = ([x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 45]: readonly number[]): NonNullable<
  PageWitnessView["camera"]
> => ({ fov, pitch: MathUtils.degToRad(pitch), position: [x, y, z], yaw: MathUtils.degToRad(yaw) });
