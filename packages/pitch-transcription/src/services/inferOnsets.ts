import { findLargestReading } from "#src/services/findLargestReading";
import { takeOne } from "@esposter/shared";

// How far a pitch's frame reading rose over both of its last two frames, never under zero
const readJump = (row: number[], previous: number[], beforePrevious: number[], pitch: number): number => {
  const reading = takeOne(row, pitch);
  return Math.max(0, Math.min(reading - takeOne(previous, pitch), reading - takeOne(beforePrevious, pitch)));
};
// The onset readings with onsets inferred from the frames added: a pitch whose frame reading jumps over both of its
// Last two frames is read as starting there, the jump scaled so the largest matches the largest onset reading, and each
// Cell keeps the larger of the two. The first two frames have no history and infer nothing: each stands as its own
// History, so its jump is zero. The jumps are read twice, for their largest and then for each cell, rather than kept as
// A matrix of their own
export const inferOnsets = (onsets: number[][], frames: number[][]): number[][] => {
  let largestJump = 0;
  for (let frame = 2; frame < frames.length; frame++) {
    const row = takeOne(frames, frame);
    const previous = takeOne(frames, frame - 1);
    const beforePrevious = takeOne(frames, frame - 2);
    for (let pitch = 0; pitch < row.length; pitch++)
      largestJump = Math.max(largestJump, readJump(row, previous, beforePrevious, pitch));
  }
  if (largestJump === 0) return onsets;
  const scale = findLargestReading(onsets) / largestJump;
  return onsets.map((onsetRow, frame) => {
    const row = takeOne(frames, frame);
    const previous = frame < 2 ? row : takeOne(frames, frame - 1);
    const beforePrevious = frame < 2 ? row : takeOne(frames, frame - 2);
    return onsetRow.map((reading, pitch) => Math.max(reading, scale * readJump(row, previous, beforePrevious, pitch)));
  });
};
