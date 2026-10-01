import type { ParityPageOptions } from "#src/models/genshinParity/ParityPageOptions";

import { FILMS_DIRECTORY, PARITY_FRAME_MS } from "#src/services/genshinParity/constants";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { resolveSource } from "#src/services/genshinParity/resolveSource";
import { writeContactSheet } from "#src/services/genshinParity/writeContactSheet";
import { writeVideoFrames } from "#src/services/genshinParity/writeVideoFrames";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Each of our stills over the recording's frame at its moment, the recording scaled to our width
const pairWithRecording = async (
  framePaths: readonly string[],
  directory: string,
  { source, startSeconds }: { source: string; startSeconds: number },
  stepMs: number,
): Promise<string[]> => {
  const recordingDirectory = join(directory, "recording");
  const pairsDirectory = join(directory, "pairs");
  await Promise.all([mkdir(recordingDirectory), mkdir(pairsDirectory)]);
  const recordingPaths = await writeVideoFrames(
    await resolveSource(source),
    1000 / stepMs,
    recordingDirectory,
    startSeconds,
    (framePaths.length * stepMs) / 1000,
  );
  return Promise.all(
    framePaths.map(async (framePath, index) => {
      const ours = sharp(framePath);
      const { height, width } = await ours.metadata();
      const recordingPath = recordingPaths[index];
      const recording = recordingPath ? await sharp(recordingPath).resize({ height, width }).toBuffer() : undefined;
      const pairPath = join(pairsDirectory, `${String(index + 1).padStart(4, "0")}.png`);
      await sharp({ create: { background: "#000", channels: 3, height: height * 2, width } })
        .composite([
          { input: await ours.toBuffer(), left: 0, top: 0 },
          ...(recording ? [{ input: recording, left: 0, top: height }] : []),
        ])
        .png()
        .toFile(pairPath);
      return pairPath;
    }),
  );
};
// A screen's motion as stills at exact moments and a contact sheet of them: its clock is faked and moved on a frame at
// A time, so a scene's motion is shot at the moments asked however slowly the page draws, from 0 when it is ready.
// Props set at moments play the screen's stages over it, as a click or a load would, so its timing can be laid frame by
// Frame beside a recording's sampled at the same rate: given one, each still is laid over the recording's frame at the
// Same moment from the second given, and the sheet is of the pairs
export const filmScreen = async ({
  beside,
  durationMs,
  propsAt = {},
  stepMs,
  ...options
}: ParityPageOptions & {
  // A recording, a video or a wiki File: title, and the second of it the film's first moment stands for
  beside?: { source: string; startSeconds: number };
  durationMs: number;
  // Props set over the screen's at each moment, by its milliseconds
  propsAt?: Record<string, Record<string, unknown>>;
  stepMs: number;
}): Promise<string[]> => {
  // A step of none or of Infinity (an fps of 0) would never move the clock past a moment, and the film would never end
  if (!Number.isFinite(stepMs) || stepMs <= 0)
    throw new InvalidOperationError(Operation.Read, "fps", "not a positive number of stills a second");
  const directory = join(FILMS_DIRECTORY, options.screen);
  await rm(directory, { force: true, recursive: true });
  await mkdir(directory, { recursive: true });
  const { browser, page } = await openParityPage({ ...options, isClockFaked: true });
  const momentProps = Object.entries(propsAt)
    .map(([ms, props]) => ({ ms: Number(ms), props }))
    .toSorted((first, second) => first.ms - second.ms);
  const framePaths = await withFinalizerAsync(
    async () => {
      const paths: string[] = [];
      for (let timeMs = 0; timeMs <= durationMs; timeMs += stepMs) {
        // The props set since the last moment shot, in their order
        for (const { props } of momentProps.filter(({ ms }) => ms <= timeMs && ms > timeMs - stepMs))
          // oxlint-disable-next-line no-await-in-loop -- the props belong to this moment, before its frame is drawn
          await page.evaluate((screenProps) => {
            (Reflect.get(window, "setScreenProps") as (props: Record<string, unknown>) => void)(screenProps);
          }, props);
        const path = join(directory, `${String(paths.length + 1).padStart(4, "0")}.png`);
        // oxlint-disable-next-line no-await-in-loop -- one moment is shot before the clock moves on to the next
        await page.screenshot({ path });
        paths.push(path);
        for (let movedMs = 0; movedMs < stepMs; movedMs += PARITY_FRAME_MS)
          // oxlint-disable-next-line no-await-in-loop -- the page draws one frame after another
          await page.clock.runFor(Math.min(PARITY_FRAME_MS, stepMs - movedMs));
      }
      return paths;
    },
    () => browser.close(),
  );
  const sheetPath = join(directory, "sheet.png");
  const sheetFramePaths = beside ? await pairWithRecording(framePaths, directory, beside, stepMs) : framePaths;
  await writeContactSheet(sheetFramePaths, 1000 / stepMs, 0, sheetPath);
  console.log(`${framePaths.length} frames, ${stepMs}ms apart: ${directory}`);
  console.log(sheetPath);
  return framePaths;
};
