import type { SceneKindRange } from "#src/models/genshinParity/shared/SceneKindRange";
import type { Page } from "playwright";

import { RANGE_FRAMES, SETTLE_FRAMES } from "#src/services/genshinParity/shared/constants";
import { setKindHidden } from "#src/services/genshinParity/shared/setKindHidden";
import { waitFrames } from "#src/services/genshinParity/shared/waitFrames";

// The frames drawn with one kind hidden, the frames before it and after it left to settle
export const measureKind = async (
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
