import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";

// The hitmarks readGcsimQueuedAttacks reads for a file's queue calls with the cited line among their lines, each the
// Delay its call is queued at with the tasks around it, as the mechanical path writes it. Where the cited hit has a loop
// Index, only the call of the iteration that index names is one of them
export const readQueuedHitmarks = (
  queuedAttacks: readonly GcsimQueuedAttack[],
  fileName: string,
  line: number,
  hitIndex: number | undefined,
  loopIndex: string | undefined,
): number[] =>
  queuedAttacks.flatMap(({ delay, file, iterations, lastLine, line: firstLine }) =>
    file === fileName &&
    firstLine <= line &&
    line <= lastLine &&
    delay !== undefined &&
    (hitIndex === undefined || loopIndex === undefined || iterations?.[loopIndex] === hitIndex)
      ? [delay]
      : [],
  );
