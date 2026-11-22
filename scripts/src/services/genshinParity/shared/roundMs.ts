import { roundToScale } from "#src/services/genshinParity/shared/roundToScale";

const TENTHS_PER_MS = 10;

export const roundMs = (ms: number): number => roundToScale(ms, TENTHS_PER_MS);
