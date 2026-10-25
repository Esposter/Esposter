const MS_DECIMALS = 10;

export const roundMs = (ms: number): number => Math.round(ms * MS_DECIMALS) / MS_DECIMALS;
