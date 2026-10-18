import { OVERLAPPING_FRAMES } from "#src/constants";

// One output of the model's windows as a frame to a row: the half of the overlap at each end of a window trimmed, since
// Its neighbour reads those frames from further inside, and the windows laid end to end
export const unwrapWindowReadings = (readings: Float32Array, binCount: number): number[][] => {
  const frameCount = readings.length / binCount;
  const rows: number[][] = [];
  for (let frame = OVERLAPPING_FRAMES / 2; frame < frameCount - OVERLAPPING_FRAMES / 2; frame++)
    rows.push([...readings.subarray(frame * binCount, (frame + 1) * binCount)]);
  return rows;
};
