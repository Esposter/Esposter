import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Page } from "playwright";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";

// The witness page's whole G-buffer at the view last set
export const readWitnessGbuffer = async (page: Page): Promise<WitnessGbuffer> => {
  const {
    targets: {
      albedo = new Float32Array(),
      depth = new Float32Array(),
      normal = new Float32Array(),
      part = new Float32Array(),
    },
    ...rest
  } = await readWitnessTargets(page, Object.values(WitnessTargetName));
  return { ...rest, albedo, depth, normal, part };
};
