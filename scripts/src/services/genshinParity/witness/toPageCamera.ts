import type { PageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";

// A pose along `CAMERA_POSE_AXES` (metres, then degrees) as the parity page's witness camera takes it, in radians but
// For its field of view
export const toPageCamera = ([x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 45]: readonly number[]): NonNullable<
  PageWitnessView["camera"]
> => ({ fov, pitch: (pitch * Math.PI) / 180, position: [x, y, z], yaw: (yaw * Math.PI) / 180 });
