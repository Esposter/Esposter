export const toUint16 = (value: number): number[] => [(value >> 8) & 0xff, value & 0xff];
