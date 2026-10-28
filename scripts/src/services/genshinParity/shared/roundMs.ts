const TENTHS_PER_MS = 10;

export const roundMs = (ms: number): number => Math.round(ms * TENTHS_PER_MS) / TENTHS_PER_MS;
