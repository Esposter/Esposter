import type { Page } from "playwright";

import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { findFamilyBoundaries } from "#src/services/genshinParity/findFamilyBoundaries";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { readStructureEdges } from "#src/services/genshinParity/readStructureEdges";
import { readWitnessGbuffer } from "#src/services/genshinParity/readWitnessGbuffer";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The simplex's first steps along each axis, metres then degrees: a solved pose is within a few of these
const REFINE_STEPS = [0.05, 0.05, 0.05, 0.2, 0.2, 0.2];
// A pose refined from a solved one by a few steps of the simplex on the edges alone: the mean distance, in pixels at
// The page's size, from the witness's family boundaries (of the families given, from its part target rather than its
// Shading) to the reference's nearest edge, so the clouds, which draw no part, cannot pull it. It returns the pose and
// Its distance before and after. The axes held stay at the pose's values, as they did through the solve
export const refineCameraPose = async (
  page: Page,
  image: Buffer,
  pose: readonly number[],
  families: readonly string[],
  iterationCount: number,
  heldAxes: readonly number[] = [],
): Promise<{ after: number; before: number; pose: number[] }> => {
  const { families: drawnFamilies, height, width } = await readWitnessGbuffer(page);
  if (families.length === 0) throw new InvalidOperationError(Operation.Read, "families", "none given to refine on");
  for (const family of families)
    if (!drawnFamilies.includes(family))
      throw new InvalidOperationError(
        Operation.Read,
        family,
        `not a family the witness draws: ${drawnFamilies.join(", ")}`,
      );
  const edgeDistances = computeDistanceTransform(await readStructureEdges(image, height), width, height);
  const readDistance = async (candidate: readonly number[]): Promise<number> => {
    await setPageWitnessView(page, { camera: toPageCamera(candidate) });
    const gbuffer = await readWitnessGbuffer(page);
    const { familyIndices, mask } = findFamilyBoundaries(gbuffer);
    const familyIndexSet = new Set(families.map((family) => gbuffer.families.indexOf(family)));
    let sum = 0;
    let count = 0;
    for (const [pixel, isBoundary] of mask.entries())
      if (isBoundary && familyIndexSet.has(familyIndices[pixel] ?? -1)) {
        sum += edgeDistances[pixel] ?? 0;
        count++;
      }
    return count ? sum / count : Infinity;
  };
  const freeAxes = pose.flatMap((_, axis) => (heldAxes.includes(axis) ? [] : [axis]));
  const toPose = (free: readonly number[]): number[] =>
    pose.map((value, axis) => (heldAxes.includes(axis) ? value : (free[freeAxes.indexOf(axis)] ?? value)));
  const before = await readDistance(pose);
  const { cost, point } = await minimizeNelderMead(
    (free) => readDistance(toPose(free)),
    freeAxes.map((axis) => pose[axis] ?? 0),
    freeAxes.map((axis) => REFINE_STEPS[axis] ?? 0),
    iterationCount,
  );
  return { after: cost, before, pose: toPose(point) };
};
