import { CAPTURES_DIRECTORY, PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { runFfmpeg } from "#src/services/genshinParity/shared/runFfmpeg";
import { measureGroundShift } from "#src/services/genshinParity/witness/measureGroundShift";
import { readGroundRow } from "#src/services/genshinParity/witness/readGroundRow";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The step distances are read at and the largest shift a frame is searched to, in metres: a centimetre, and more
// Than a frame's glide at any pace a login shows
const GROUND_STEP = 0.01;
const LARGEST_SHIFT = 0.3;
// The pace of a world gliding toward a still camera, off a reference's recording: a column of its frames, down the
// Ground straight ahead, read at the camera's pose, and each frame's shift from the one before over a band of
// Distances (`measureGroundShift`), summed over each window into metres a second. A window's held frames, which a
// Stalling recording repeats, are counted beside it, since they say the window's time is not the game's
export const measureGlide = async (
  referenceId: string,
  {
    band,
    column: [left, columnWidth],
    durationSeconds,
    eyeHeight,
    fov,
    framesPerSecond,
    pitch,
    startSeconds,
    windowSeconds,
  }: {
    band: [number, number];
    column: [number, number];
    durationSeconds: number;
    eyeHeight: number;
    fov: number;
    framesPerSecond: number;
    pitch: number;
    startSeconds: number;
    windowSeconds: number;
  },
): Promise<{ heldCount: number; seconds: number; speed: number }[]> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference?.capture) throw new InvalidOperationError(Operation.Read, referenceId, "not a recording's frame");
  const capturePath = join(CAPTURES_DIRECTORY, reference.capture);
  const directory = join(PARITY_DIRECTORY, "glide", `${referenceId}@${startSeconds}`);
  await rm(directory, { force: true, recursive: true });
  await mkdir(directory, { recursive: true });
  // The column runs the capture's full height, read back off each decoded frame, since the reference's own frame may
  // Be cropped from it or not fetched yet
  await runFfmpeg([
    "-ss",
    String(startSeconds),
    "-t",
    String(durationSeconds),
    "-i",
    capturePath,
    "-vf",
    `fps=${framesPerSecond},crop=${columnWidth}:ih:${left}:0,format=gray`,
    join(directory, "%04d.png"),
  ]);
  const filenames = await readdir(directory);
  // Each frame's column, its rows' mean brightness across the column's width
  const columns = await Promise.all(
    filenames
      .toSorted((firstFilename, secondFilename) =>
        firstFilename.localeCompare(secondFilename, undefined, { numeric: true }),
      )
      .map(async (filename) => {
        const { data, info } = await sharp(join(directory, filename))
          .greyscale()
          .raw()
          .toBuffer({ resolveWithObject: true });
        return Float64Array.from({ length: info.height }, (_value, row) => {
          let sum = 0;
          for (let x = 0; x < info.width; x++) sum += data[(row * info.width + x) * info.channels] ?? 0;
          return sum / info.width;
        });
      }),
  );
  const height = columns[0]?.length ?? 0;
  const readRow = (distance: number): number => readGroundRow(distance, { eyeHeight, fov, height, pitch });
  const shifts = columns
    .slice(1)
    .map((later, index) =>
      measureGroundShift(columns[index] ?? later, later, {
        band,
        largestShift: LARGEST_SHIFT,
        readRow,
        step: GROUND_STEP,
      }),
    );
  const framesPerWindow = Math.round(windowSeconds * framesPerSecond);
  return Array.from({ length: Math.floor(shifts.length / framesPerWindow) }, (_, window) => {
    const windowShifts = shifts.slice(window * framesPerWindow, (window + 1) * framesPerWindow);
    return {
      heldCount: windowShifts.filter(({ shift }) => shift === 0).length,
      seconds: startSeconds + window * windowSeconds,
      speed: windowShifts.reduce((sum, { shift }) => sum + shift, 0) / windowSeconds,
    };
  });
};
