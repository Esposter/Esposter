import { takeOne } from "@esposter/shared";

// How far a pitch's frame reading rose over both of its last two frames, never under zero
export const getJump = (row: number[], previous: number[], beforePrevious: number[], pitch: number): number => {
  const reading = takeOne(row, pitch);
  return Math.max(0, Math.min(reading - takeOne(previous, pitch), reading - takeOne(beforePrevious, pitch)));
};
