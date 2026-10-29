// A value rounded to three decimal places, its trailing zeros dropped
export const formatRoundedValue = (value: number): string => String(Math.round(value * 1000) / 1000);
