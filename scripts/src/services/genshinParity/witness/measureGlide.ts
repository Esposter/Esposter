import type { GlideRepeat } from "#src/models/genshinParity/witness/GlideRepeat";

import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readCaptureRow } from "#src/services/genshinParity/shared/readCaptureRow";
import { findCrossings } from "#src/services/genshinParity/witness/findCrossings";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The pixels either side of a column averaged into its signal, so one pixel's noise does not time an edge
const COLUMN_HALF_WIDTH = 4;
// The pace of a layout gliding toward a still camera, off a reference's recording, by the time it takes to repeat: a
// Row of the recording is one distance ahead whatever the camera's pose, so a landmark's edge crosses each of its
// Columns once a repeat, and the time between a crossing and the same kind's a repeat later is the repeat's length
// Over the pace held across it. Each column's crossings are split by direction, and each crossing is paired with the
// `crossingsPerRepeat`th of its kind after it, as many as the layout's landmarks cross that column in a repeat. A
// Frame the same to the byte as the one before is one the game held, so each repeat counts those it spans
export const measureGlide = async (
  referenceId: string,
  {
    columns,
    crossingsPerRepeat,
    durationSeconds,
    repeatMetres,
    row,
    startSeconds,
  }: {
    columns: number[];
    crossingsPerRepeat: number;
    durationSeconds: number;
    repeatMetres: number;
    row: number;
    startSeconds: number;
  },
): Promise<GlideRepeat[]> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference?.capture) throw new InvalidOperationError(Operation.Read, referenceId, "not a recording's frame");
  const { lines, times } = await readCaptureRow(join(CAPTURES_DIRECTORY, reference.capture), {
    durationSeconds,
    row,
    startSeconds,
  });
  const heldTimes = lines.flatMap((line, index) => {
    const previous = lines[index - 1];
    return previous && line.equals(previous) ? [times[index] ?? 0] : [];
  });
  return columns
    .flatMap((column) => {
      const values = lines.map((line) => {
        let sum = 0;
        for (let x = column - COLUMN_HALF_WIDTH; x <= column + COLUMN_HALF_WIDTH; x++) sum += line[x] ?? 0;
        return sum / (COLUMN_HALF_WIDTH * 2 + 1);
      });
      const crossings = findCrossings(values, times);
      return [true, false].flatMap((isFalling) => {
        const kind = crossings.filter((crossing) => crossing.isFalling === isFalling);
        return kind.slice(crossingsPerRepeat).map((last, index) => {
          const first = kind[index] ?? last;
          const seconds = last.time - first.time;
          const speed = repeatMetres / seconds;
          return {
            column,
            from: first.time,
            heldCount: heldTimes.filter((time) => time > first.time && time <= last.time).length,
            isFalling,
            speed,
            to: last.time,
            uncertainty: (speed * Math.hypot(first.uncertainty, last.uncertainty)) / seconds,
          };
        });
      });
    })
    .toSorted((firstRepeat, secondRepeat) => firstRepeat.from - secondRepeat.from);
};
