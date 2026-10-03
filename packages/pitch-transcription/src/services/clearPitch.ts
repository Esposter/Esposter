import { takeOne } from "@esposter/shared";

// Zeroes a pitch and the keys either side of it in one frame of the energy a note has claimed
export const clearPitch = (energy: number[][], frame: number, pitch: number): void => {
  const row = takeOne(energy, frame);
  row[pitch] = 0;
  if (pitch + 1 < row.length) row[pitch + 1] = 0;
  if (pitch > 0) row[pitch - 1] = 0;
};
