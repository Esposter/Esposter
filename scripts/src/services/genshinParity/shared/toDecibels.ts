// A power or energy in decibels, with a value under the floor read as the floor, so a silent reading stays finite wherever
// The floor is above zero
export const toDecibels = (value: number, floor: number): number => 10 * Math.log10(Math.max(value, floor));
