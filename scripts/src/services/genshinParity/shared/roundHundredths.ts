const MS_DECIMALS = 100;

export const roundHundredths = (ms: number): number => Math.round(ms * MS_DECIMALS) / MS_DECIMALS;
