import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";

import { FRAME_LAYER } from "#src/services/genshinParity/shared/constants";

// The frame's FLIP is its pixels' mean, so a layer drawn exactly would take its share times its own FLIP off the
// Frame's: its ceiling, which ranks the layers by the most work on each could recover, largest first
export const getCeiling = ({ coverage, flip, name }: LayerScore): number =>
  name === FRAME_LAYER ? flip : coverage * flip;
