import { resolveFfmpeg } from "#src/services/genshinParity/shared/resolveFfmpeg";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// One row of a capture, two of its pixel rows averaged into a line of grey, every frame as the capture holds it with
// Its own time in seconds, read off FFmpeg's frame log, since a recording's frames need not come at an even rate
export const readCaptureRow = async (
  capturePath: string,
  { durationSeconds, row, startSeconds }: { durationSeconds: number; row: number; startSeconds: number },
): Promise<{ lines: Buffer[]; times: number[] }> => {
  const ffmpegPath = await resolveFfmpeg();
  const { status, stderr, stdout } = spawnSync(
    ffmpegPath,
    [
      "-hide_banner",
      "-loglevel",
      "info",
      "-ss",
      String(startSeconds),
      "-t",
      String(durationSeconds),
      "-i",
      capturePath,
      "-fps_mode",
      "passthrough",
      "-vf",
      `format=gray,crop=iw:2:0:${row},scale=iw:1,showinfo`,
      "-f",
      "rawvideo",
      "pipe:1",
    ],
    { maxBuffer: 1024 ** 3 },
  );
  if (status !== 0) throw new InvalidOperationError(Operation.Read, capturePath, stderr.toString());
  const times = Array.from(
    stderr.toString().matchAll(/pts_time:\s*(?<seconds>[\d.]+)/gu),
    ({ groups }) => startSeconds + Number(groups?.seconds),
  );
  const width = times.length > 0 ? stdout.length / times.length : 0;
  return { lines: times.map((_time, index) => stdout.subarray(index * width, (index + 1) * width)), times };
};
