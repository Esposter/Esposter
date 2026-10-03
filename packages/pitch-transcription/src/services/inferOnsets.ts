import { findLargestReading } from "#src/services/findLargestReading";
import { takeOne } from "@esposter/shared";

// The onset readings with onsets inferred from the frames added: a pitch whose frame reading jumps over both of its
// Last two frames is read as starting there, the jump scaled so the largest matches the largest onset reading, and each
// Cell keeps the larger of the two. The first two frames have no history and infer nothing
export const inferOnsets = (onsets: number[][], frames: number[][]): number[][] => {
  const jumps = frames.map((row, frame) => {
    if (frame < 2) return row.map(() => 0);
    const previous = takeOne(frames, frame - 1);
    const beforePrevious = takeOne(frames, frame - 2);
    return row.map((reading, pitch) =>
      Math.max(0, Math.min(reading - takeOne(previous, pitch), reading - takeOne(beforePrevious, pitch))),
    );
  });
  const largestJump = findLargestReading(jumps);
  if (largestJump === 0) return onsets;
  const scale = findLargestReading(onsets) / largestJump;
  return onsets.map((row, frame) => {
    const jumpRow = takeOne(jumps, frame);
    return row.map((reading, pitch) => Math.max(reading, scale * takeOne(jumpRow, pitch)));
  });
};
