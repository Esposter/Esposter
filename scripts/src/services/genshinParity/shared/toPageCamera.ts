import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";

import { MathUtils } from "three";

// A pose along `CAMERA_POSE_AXES` (metres, then degrees) as the parity page's witness camera takes it, in radians but
// For its field of view
export const toPageCamera = ([x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 45]: readonly number[]): NonNullable<
  WitnessView["camera"]
> => ({ fov, pitch: MathUtils.degToRad(pitch), position: [x, y, z], yaw: MathUtils.degToRad(yaw) });
