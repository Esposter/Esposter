import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Page } from "playwright";

import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { WitnessTarget } from "genshin-world/sceneExport";

// The witness page's part target alone at the view last set, all a tool pricing the parts' boundaries reads, for a
// Quarter of the whole G-buffer's drawing
export const readWitnessPartTarget = async (
  page: Page,
): Promise<Pick<WitnessGbuffer, "families" | "height" | "part" | "parts" | "width">> => {
  const {
    targets: { part = new Float32Array() },
    ...rest
  } = await readWitnessTargets(page, [WitnessTarget.Part]);
  return { ...rest, part };
};
