import { roundToScale } from "#src/services/genshinParity/shared/roundToScale";

const HUNDREDTHS_PER_MS = 100;

export const roundHundredths = (ms: number): number => roundToScale(ms, HUNDREDTHS_PER_MS);
