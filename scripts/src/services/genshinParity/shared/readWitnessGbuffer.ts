import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";
import type { Page } from "playwright";

import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { WitnessTarget } from "genshin-world/sceneExport";

// The witness page's G-buffer at the view last set: the four targets it holds, each read alone
export const readWitnessGbuffer = async (page: Page): Promise<WitnessGbuffer> => {
  const {
    targets: {
      albedo = new Float32Array(),
      depth = new Float32Array(),
      normal = new Float32Array(),
      part = new Float32Array(),
    },
    ...rest
  } = await readWitnessTargets(page, [
    WitnessTarget.Albedo,
    WitnessTarget.Depth,
    WitnessTarget.Normal,
    WitnessTarget.Part,
  ]);
  return { ...rest, albedo, depth, normal, part };
};
