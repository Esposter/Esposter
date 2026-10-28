const HUNDREDTHS_PER_MS = 100;

export const roundHundredths = (ms: number): number => Math.round(ms * HUNDREDTHS_PER_MS) / HUNDREDTHS_PER_MS;
