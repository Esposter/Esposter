import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { CAPTURES_DIRECTORY, PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { refineCameraPose } from "#src/services/genshinParity/refineCameraPose";
import { writeVideoFrames } from "#src/services/genshinParity/writeVideoFrames";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The camera's path across a recording, the matchmove: its reference's capture sampled at the rate given from a
// Start, and the pose at each frame refined on the edges of the families given from the frame before's, the first from
// The pose given, on the reference's own witness page. The track (each frame's time, pose and edge distance) is written
// Beside the references and returned. Given a top row, in the capture's own pixels, only the edges below it are
// Priced
export const trackCamera = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  {
    durationSeconds,
    families,
    framesPerSecond,
    iterationCount,
    start,
    startSeconds,
    topRow = 0,
  }: {
    durationSeconds: number;
    families: string[];
    framesPerSecond: number;
    iterationCount: number;
    start: number[];
    startSeconds: number;
    topRow?: number;
  },
): Promise<{ path: string; track: { distance: number; pose: number[]; seconds: number }[] }> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference?.capture) throw new InvalidOperationError(Operation.Read, referenceId, "not a recording's frame");
  await fetchReferences();
  const directory = join(PARITY_DIRECTORY, "track", `${referenceId}@${startSeconds}`);
  await rm(directory, { force: true, recursive: true });
  await mkdir(directory, { recursive: true });
  const framePaths = await writeVideoFrames(
    join(CAPTURES_DIRECTORY, reference.capture),
    framesPerSecond,
    directory,
    startSeconds,
    durationSeconds,
  );
  const { browser, height, page } = await openWitnessPage(referenceId, witness);
  const track = await withFinalizerAsync(
    async () => {
      const poses: { distance: number; pose: number[]; seconds: number }[] = [];
      let previous = start;
      for (const [index, framePath] of framePaths.entries()) {
        const { crop } = reference;
        // oxlint-disable-next-line no-await-in-loop -- each frame is read when its turn comes
        const frame = sharp(await readFile(framePath));
        // oxlint-disable-next-line no-await-in-loop -- as above
        const { height: frameHeight } = await frame.metadata();
        const cropped = crop
          ? frame.extract({ height: crop.height, left: crop.x, top: crop.y, width: crop.width })
          : frame;
        // oxlint-disable-next-line no-await-in-loop -- each frame is solved from the pose before it
        const image = await cropped.resize({ height }).removeAlpha().png().toBuffer();
        // oxlint-disable-next-line no-await-in-loop -- as above
        const { after, pose } = await refineCameraPose(page, image, previous, families, iterationCount, {
          topRow: ((topRow - (crop?.y ?? 0)) * height) / (crop?.height ?? frameHeight),
        });
        poses.push({ distance: after, pose, seconds: startSeconds + index / framesPerSecond });
        previous = pose;
      }
      return poses;
    },
    () => browser.close(),
  );
  const path = join(directory, "track.json");
  await writeFile(path, JSON.stringify(track, null, 2));
  return { path, track };
};
