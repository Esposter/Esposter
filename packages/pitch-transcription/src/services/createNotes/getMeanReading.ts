import { takeOne } from "@esposter/shared";

export const getMeanReading = (frames: number[][], start: number, end: number, pitch: number): number => {
  let sum = 0;
  for (let frame = start; frame < end; frame++) sum += takeOne(takeOne(frames, frame), pitch);
  return sum / (end - start);
};
