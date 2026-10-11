/* oxlint-disable no-underscore-dangle -- the names are the page's own globals, which the kinds script sets */
import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";
import type { SceneKindRange } from "#src/models/genshinParity/shared/SceneKindRange";
import type { SceneKindTrace } from "#src/models/genshinParity/shared/SceneKindTrace";
import type { Page } from "playwright";

import { TRACE_KINDS_SCRIPT } from "#src/services/genshinParity/shared/traceKindsScript";

declare global {
  interface Window {
    __sceneKinds?: () => Pick<SceneKindRange, "drawables" | "kind">[];
    __setSceneKindHidden?: (kind: string, isHidden: boolean) => void;
    __waitFrames?: (count: number) => Promise<FrameRange>;
  }
}

// The frames a range reads, and the frames left to pass before it, so the GPU has finished the frames encoded before a
// Kind was hidden or shown again and the camera has come to rest after the walk
const RANGE_FRAMES = 120;
const SETTLE_FRAMES = 30;

const waitFrames = (page: Page, count: number): Promise<FrameRange> =>
  page.evaluate((frameCount) => window.__waitFrames?.(frameCount) ?? { endFrame: 0, firstFrame: 0 }, count);

const setKindHidden = (page: Page, kind: string, isHidden: boolean): Promise<void> =>
  page.evaluate(
    ({ hidden, sceneKind }) => {
      window.__setSceneKindHidden?.(sceneKind, hidden);
    },
    { hidden: isHidden, sceneKind: kind },
  );

// The frames drawn with one kind hidden, the frames before it and after it left to settle
const measureKind = async (
  page: Page,
  { drawables, kind }: Pick<SceneKindRange, "drawables" | "kind">,
): Promise<SceneKindRange> => {
  await setKindHidden(page, kind, true);
  await waitFrames(page, SETTLE_FRAMES);
  const range = await waitFrames(page, RANGE_FRAMES);
  await setKindHidden(page, kind, false);
  await waitFrames(page, SETTLE_FRAMES);
  return { ...range, drawables, kind };
};

// The scene drawn with the camera still, each kind of its objects hidden in turn between ranges with every kind drawn,
// So the GPU's time on each pass is read against each kind beside the frames either side of it
export const measureSceneKinds = async (page: Page): Promise<SceneKindTrace> => {
  await page.evaluate(TRACE_KINDS_SCRIPT);
  const sceneKinds = await page.evaluate(() => window.__sceneKinds?.() ?? []);
  await waitFrames(page, SETTLE_FRAMES);
  const baselines = [await waitFrames(page, RANGE_FRAMES)];
  const kinds: SceneKindRange[] = [];
  for (const sceneKind of sceneKinds) {
    // oxlint-disable-next-line no-await-in-loop -- each kind is hidden alone, one after another
    kinds.push(await measureKind(page, sceneKind));
    // oxlint-disable-next-line no-await-in-loop -- each kind is read against the frames either side of it
    baselines.push(await waitFrames(page, RANGE_FRAMES));
  }
  // The last range's passes are read back from the GPU after their frames
  await waitFrames(page, SETTLE_FRAMES);
  return { baselines, kinds };
};
