import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";

import { MathUtils } from "three";

// The parity page's camera as a pose along `CAMERA_POSE_AXES` (metres, then degrees), `toPageCamera` undone
export const fromPageCamera = ({
  fov,
  pitch,
  position: [x, y, z],
  yaw,
}: NonNullable<WitnessView["camera"]>): number[] => [x, y, z, MathUtils.radToDeg(yaw), MathUtils.radToDeg(pitch), fov];
