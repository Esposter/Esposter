import type { WhiteBalance } from "genshin-engine";

import { clamp } from "#src/services/genshinParity/display/clamp";

// A temperature and a tint held within the range Unity's white balance takes
export const clampWhiteBalance = ([temperature = 0, tint = 0]: readonly number[]): WhiteBalance => ({
  temperature: clamp(temperature),
  tint: clamp(tint),
});
