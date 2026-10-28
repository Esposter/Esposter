import type { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

import { readWitnessTargetsInCall } from "#src/services/genshinParity/shared/readWitnessTargetsInCall";

// The witness page's targets at the view last set, as its `renderWitnessTargets` reads them back from the renderer.
// The page draws them at the reference's full 1920 by 1080, not the structure's width, so each float target is 33 MB,
// And one call moving all eight held the renderer for seconds, long enough for the page to be closed under it, where each
// Target alone moves its 33 MB in about a second. So each target is drawn and read in a call of
// Its own; the families, the parts and the view's size come from a call drawing none, which draws nothing. Told to, of
// The scene's own parts in place of the exports', and given a direction, under the sun cast from it for this read alone
export const readWitnessTargets = async (
  page: Page,
  names: readonly WitnessTargetName[],
  isScene = false,
  lightDirection?: Readonly<Vector>,
): Promise<Awaited<ReturnType<typeof readWitnessTargetsInCall>>> => {
  const { families, height, parts, width } = await readWitnessTargetsInCall(page, [], isScene, lightDirection);
  const targets: Partial<Record<WitnessTargetName, Float32Array>> = {};
  for (const name of names) {
    // oxlint-disable-next-line no-await-in-loop -- one target is drawn and read back before the next is drawn into it
    const { targets: callTargets } = await readWitnessTargetsInCall(page, [name], isScene, lightDirection);
    Object.assign(targets, callTargets);
  }
  return { families, height, parts, targets, width };
};
