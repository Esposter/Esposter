export const toDecibels = (power: number): number => 10 * Math.log10(Math.max(power, Number.MIN_VALUE));
