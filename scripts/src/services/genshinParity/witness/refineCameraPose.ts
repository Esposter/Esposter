import type { Page } from "playwright";

import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { readFamilyEdgeDistance } from "#src/services/genshinParity/witness/readFamilyEdgeDistance";
import { readFamilyEdgeDistances } from "#src/services/genshinParity/witness/readFamilyEdgeDistances";
import { toPageCamera } from "#src/services/genshinParity/witness/toPageCamera";

// The simplex's first steps along each axis, metres then degrees: a solved pose is within a few of these
const REFINE_STEPS = [0.05, 0.05, 0.05, 0.2, 0.2, 0.2];
// A pose refined from a solved one by a few steps of the simplex on the edges alone: the mean distance, in pixels at
// The page's size, from the witness's family boundaries (of the families given, from its part target rather than its
// Shading) to the reference's nearest edge, so the clouds, which draw no part, cannot pull it. It returns the pose and
// Its distance before and after. The axes held stay at the pose's values, as they did through the solve, and only
// The boundaries from the row given down are priced, where what lies above it differs from the exports (a walkway
// Still assembling at its far end)
export const refineCameraPose = async (
  page: Page,
  image: Buffer,
  pose: readonly number[],
  families: readonly string[],
  iterationCount: number,
  { heldAxes = [], topRow = 0 }: { heldAxes?: readonly number[]; topRow?: number } = {},
): Promise<{ after: number; before: number; pose: number[] }> => {
  const { edgeDistances, topPixel } = await readFamilyEdgeDistances(page, image, families, topRow);
  const readDistance = async (candidate: readonly number[]): Promise<number> => {
    await setPageWitnessView(page, { camera: toPageCamera(candidate) });
    return readFamilyEdgeDistance(page, { edgeDistances, families, topPixel });
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
