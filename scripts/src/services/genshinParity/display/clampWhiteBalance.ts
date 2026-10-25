import type { WhiteBalance } from "genshin-engine";

import { clamp } from "#src/services/genshinParity/shared/clamp";

// Unity's white balance runs from minus to plus a hundred each way
const MAX_BALANCE = 100;

// A temperature and a tint held within the range Unity's white balance takes
export const clampWhiteBalance = ([temperature = 0, tint = 0]: readonly number[]): WhiteBalance => ({
  temperature: clamp(temperature, -MAX_BALANCE, MAX_BALANCE),
  tint: clamp(tint, -MAX_BALANCE, MAX_BALANCE),
});
