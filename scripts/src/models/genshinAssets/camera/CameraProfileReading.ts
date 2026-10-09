import type { CameraConfigReading } from "#src/models/genshinAssets/camera/CameraConfigReading";

// The game's camera profile as read: the camera module each of its configs serves, in order, and its global config,
// Word by word
export interface CameraProfileReading {
  globalConfig: CameraConfigReading[];
  moduleTypes: number[];
}
