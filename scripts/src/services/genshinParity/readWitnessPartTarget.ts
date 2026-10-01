import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/WitnessTargetName";
import { readWitnessTargets } from "#src/services/genshinParity/readWitnessTargets";

// The witness page's part target alone at the view last set, all a tool pricing the parts' boundaries reads, for a
// Quarter of the whole G-buffer's drawing
export const readWitnessPartTarget = async (
  page: Page,
): Promise<Pick<WitnessGbuffer, "families" | "height" | "part" | "parts" | "width">> => {
  const {
    targets: { part = new Float32Array() },
    ...rest
  } = await readWitnessTargets(page, [WitnessTargetName.Part]);
  return { ...rest, part };
};
