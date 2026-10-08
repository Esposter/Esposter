import type { WhiteBalance } from "genshin-engine";

// Unity's white balance runs from minus to plus a hundred each way
const MAX_BALANCE = 100;
const clamp = (value: number): number => Math.min(Math.max(value, -MAX_BALANCE), MAX_BALANCE);
// A temperature and a tint held within the range Unity's white balance takes
export const clampWhiteBalance = ([temperature = 0, tint = 0]: readonly number[]): WhiteBalance => ({
  temperature: clamp(temperature),
  tint: clamp(tint),
});
