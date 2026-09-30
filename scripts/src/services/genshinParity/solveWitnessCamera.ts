import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Page } from "playwright";

import { COMPARISONS_DIRECTORY, REFERENCES_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { scoreEdgeDistance } from "#src/services/genshinParity/scoreEdgeDistance";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
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
  await page.evaluate((pose) => (Reflect.get(window, "setWitnessCamera") as (pose: unknown) => Promise<void>)(pose), {
    fov,
    isAlone: true,
    pitch: (pitch * Math.PI) / 180,
    position: [x, y, z],
    yaw: (yaw * Math.PI) / 180,
  });
  return page.screenshot();
};
// The camera pose from which the witness render's edges sit nearest a reference's, the scene drawing the exports
// Alone: every combination of the ranges given is tried, then the simplex refines the best few. The page is opened
// Once and shot at the structure's width, so a pose costs one render and one score. The best pose's shot is written
// Beside the comparisons
export const solveWitnessCamera = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  start: readonly number[],
  ranges: Partial<Record<(typeof CAMERA_POSE_AXES)[number], number[]>>,
  iterationCount: number,
): Promise<{ distance: number; pose: number[] }> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
  await fetchReferences();
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const { height: referenceHeight, width: referenceWidth } = await sharp(referencePath).metadata();
  const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
  const referenceImage = await sharp(referencePath).resize(STRUCTURE_WIDTH, height).removeAlpha().png().toBuffer();
  const { browser, page } = await openParityPage({
    height,
    props: reference.props,
    screen: reference.screen,
    width: STRUCTURE_WIDTH,
    witness,
  });
  return withFinalizerAsync(
    async () => {
      const cost = async (pose: number[]): Promise<number> =>
        scoreEdgeDistance(referenceImage, await shootPose(page, pose));
      let candidates: number[][] = [[...start]];
      for (const [axis, values] of Object.entries(ranges)) {
        const index = CAMERA_POSE_AXES.indexOf(axis);
        candidates = candidates.flatMap((candidate) =>
          (values ?? []).map((value) => candidate.map((current, position) => (position === index ? value : current))),
        );
      }
      const scored: { cost: number; point: number[] }[] = [];
      for (const [index, candidate] of candidates.entries()) {
        // oxlint-disable-next-line no-await-in-loop -- one page renders one pose at a time
        scored.push({ cost: await cost(candidate), point: candidate });
        if (index % 50 === 0) console.log(`${index} of ${candidates.length} poses tried`);
      }
      scored.sort((first, second) => first.cost - second.cost);
      let best = scored[0] ?? { cost: Number.POSITIVE_INFINITY, point: [...start] };
      for (const { point } of scored.slice(0, REFINE_STARTS)) {
        // oxlint-disable-next-line no-await-in-loop -- as above
        const refined = await minimizeNelderMead(cost, point, POSE_STEPS, iterationCount);
        console.log(
          `refined from ${point.join(",")}: ${refined.cost.toFixed(2)} at ${refined.point.map((value) => value.toFixed(2)).join(",")}`,
        );
        if (refined.cost < best.cost) best = refined;
      }
      await mkdir(COMPARISONS_DIRECTORY, { recursive: true });
      const shot = await shootPose(page, best.point);
      const panels = await Promise.all(
        [referenceImage, shot].map((input) => sharp(input).resize(STRUCTURE_WIDTH, height).png().toBuffer()),
      );
      const overlay = await sharp(panels[0])
        .composite([{ blend: "difference", input: panels[1] ?? shot }])
        .png()
        .toBuffer();
      await writeFile(
        join(COMPARISONS_DIRECTORY, `${referenceId}.camera.png`),
        await sharp({ create: { background: "#000", channels: 3, height, width: STRUCTURE_WIDTH * 3 } })
          .composite([...panels, overlay].map((input, index) => ({ input, left: index * STRUCTURE_WIDTH, top: 0 })))
          .png()
          .toBuffer(),
      );
      return { distance: best.cost, pose: best.point };
    },
    () => browser.close(),
  );
};
