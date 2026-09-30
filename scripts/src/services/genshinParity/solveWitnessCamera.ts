import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { WitnessPage } from "#src/services/genshinParity/openWitnessPages";
import type { Page } from "playwright";

import { COMPARISONS_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { openWitnessPages } from "#src/services/genshinParity/openWitnessPages";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A pose as the search moves it: the eye's x, y and z in three's axes, its heading and pitch in degrees, and its
// Vertical field of view in degrees
export const CAMERA_POSE_AXES = ["x", "y", "z", "yaw", "pitch", "fov"] as const;
// The simplex's first steps along each axis: metres, then degrees
const POSE_STEPS = [2, 1, 4, 2, 0.5, 1];
// How many of the grid's best cells the simplex refines from, since a grid cell's best is only near a basin's floor
const REFINE_STARTS = 3;
// The page's shot from one pose, the scene drawing the witness alone
const shootPose = async (
  page: Page,
  [x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 45]: readonly number[],
): Promise<Buffer> => {
  await setPageWitnessView(page, {
    camera: { fov, pitch: (pitch * Math.PI) / 180, position: [x, y, z], yaw: (yaw * Math.PI) / 180 },
    isAlone: true,
  });
  return page.screenshot();
};
// A pose's cost: the mean over every reference's page of its line distance from that reference
const readPoseCost = async (views: readonly WitnessPage[], pose: readonly number[]): Promise<number> => {
  const distances = await Promise.all(
    views.map(async ({ page, scoreLines }) => scoreLines(await shootPose(page, pose))),
  );
  return distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
};
// The camera pose from which the witness render's long vertical lines, its towers' sides, sit nearest those of every
// Reference given, which must share one pose: every combination of the ranges given is tried, then the simplex refines
// The best few. Each reference is shot on a page of its own at the structure's width, in its own state (its props, a
// Time of day), and a pose's cost is the mean over them, so no one view can be fooled. The best pose's shot beside
// Each reference is written beside the comparisons
export const solveWitnessCamera = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
  start: readonly number[],
  ranges: Partial<Record<(typeof CAMERA_POSE_AXES)[number], number[]>>,
  iterationCount: number,
): Promise<{ distance: number; pose: number[] }> => {
  const views = await openWitnessPages(referenceIds, witness);
  return withFinalizerAsync(
    async () => {
      let candidates: number[][] = [[...start]];
      for (const [axis, values] of Object.entries(ranges)) {
        const index = CAMERA_POSE_AXES.indexOf(axis);
        candidates = candidates.flatMap((candidate) =>
          (values ?? []).map((value) => candidate.map((current, position) => (position === index ? value : current))),
        );
      }
      const scored: { cost: number; point: number[] }[] = [];
      for (const [index, candidate] of candidates.entries()) {
        // oxlint-disable-next-line no-await-in-loop -- each page renders one pose at a time
        scored.push({ cost: await readPoseCost(views, candidate), point: candidate });
        if (index % 50 === 0) console.log(`${index} of ${candidates.length} poses tried`);
      }
      scored.sort((first, second) => first.cost - second.cost);
      let best = scored[0] ?? { cost: Number.POSITIVE_INFINITY, point: [...start] };
      if (iterationCount > 0)
        for (const { point } of scored.slice(0, REFINE_STARTS)) {
          // oxlint-disable-next-line no-await-in-loop -- as above
          const refined = await minimizeNelderMead(
            (pose) => readPoseCost(views, pose),
            point,
            POSE_STEPS,
            iterationCount,
          );
          console.log(
            `refined from ${point.join(",")}: ${refined.cost.toFixed(2)} at ${refined.point.map((value) => value.toFixed(2)).join(",")}`,
          );
          if (refined.cost < best.cost) best = refined;
        }
      await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
      for (const { height, image, page, referenceId } of views) {
        // oxlint-disable-next-line no-await-in-loop -- one shot and its comparison at a time
        const shot = await sharp(await shootPose(page, best.point))
          .resize(STRUCTURE_WIDTH, height)
          .png()
          .toBuffer();
        // oxlint-disable-next-line no-await-in-loop -- as above
        const difference = await sharp(image)
          .composite([{ blend: "difference", input: shot }])
          .png()
          .toBuffer();
        // oxlint-disable-next-line no-await-in-loop -- as above
        const sheet = await sharp({ create: { background: "#000", channels: 3, height, width: STRUCTURE_WIDTH * 3 } })
          .composite(
            [image, shot, difference].map((input, index) => ({ input, left: index * STRUCTURE_WIDTH, top: 0 })),
          )
          .png()
          .toBuffer();
        // oxlint-disable-next-line no-await-in-loop -- as above
        await writeFile(join(COMPARISONS_DIRECTORY, `${referenceId}.camera.png`), sheet);
      }
      return { distance: best.cost, pose: best.point };
    },
    async () => {
      await Promise.all(views.map(({ browser }) => browser.close()));
    },
  );
};
