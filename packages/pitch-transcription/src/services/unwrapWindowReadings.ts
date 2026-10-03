import type { Tensor2D, Tensor3D } from "@tensorflow/tfjs";

import { OVERLAPPING_FRAMES } from "#src/constants";

// One output of the model's windows as a frame to a row: the half of the overlap at each end of a window trimmed, since
// Its neighbour reads those frames from further inside, and the windows laid end to end
export const unwrapWindowReadings = (readings: Tensor3D): Tensor2D => {
  const [windowCount, frameCount, binCount] = readings.shape;
  const trimmed = readings.slice([0, OVERLAPPING_FRAMES / 2, 0], [-1, frameCount - OVERLAPPING_FRAMES, -1]);
  return trimmed.reshape([windowCount * (frameCount - OVERLAPPING_FRAMES), binCount]);
};
