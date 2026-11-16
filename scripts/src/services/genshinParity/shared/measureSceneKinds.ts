/* oxlint-disable no-await-in-loop -- One device: each kind is hidden alone on the one page, and restored before the next is hidden; Order is the contract: each kind is read against the frames either side of it, in the order the page drew them */
/* oxlint-disable no-underscore-dangle -- the names are the page's own globals, which the kinds script sets */

import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";
import type { SceneKindRange } from "#src/models/genshinParity/shared/SceneKindRange";
import type { SceneKindTrace } from "#src/models/genshinParity/shared/SceneKindTrace";
import type { Page } from "playwright";

import { RANGE_FRAMES, SETTLE_FRAMES } from "#src/services/genshinParity/shared/constants";
import { measureKind } from "#src/services/genshinParity/shared/measureKind";
import { TRACE_KINDS_SCRIPT } from "#src/services/genshinParity/shared/traceKindsScript";
import { waitFrames } from "#src/services/genshinParity/shared/waitFrames";

declare global {
  interface Window {
    __sceneKinds?: () => Pick<SceneKindRange, "drawables" | "kind">[];
    __setSceneKindHidden?: (kind: string, isHidden: boolean) => void;
    __waitFrames?: (count: number) => Promise<FrameRange>;
  }
}

// The scene drawn with the camera still, each kind of its objects hidden in turn between ranges with every kind drawn,
// So the GPU's time on each pass is read against each kind beside the frames either side of it
export const measureSceneKinds = async (page: Page): Promise<SceneKindTrace> => {
  await page.evaluate(TRACE_KINDS_SCRIPT);
  const sceneKinds = await page.evaluate(() => window.__sceneKinds?.() ?? []);
  await waitFrames(page, SETTLE_FRAMES);
  const baselines = [await waitFrames(page, RANGE_FRAMES)];
  const kinds: SceneKindRange[] = [];
  for (const sceneKind of sceneKinds) {
    kinds.push(await measureKind(page, sceneKind));
    baselines.push(await waitFrames(page, RANGE_FRAMES));
  }
  // The last range's passes are read back from the GPU after their frames
  await waitFrames(page, SETTLE_FRAMES);
  return { baselines, kinds };
};
