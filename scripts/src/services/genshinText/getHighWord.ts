export const getHighWord = (value: bigint): number => Number(BigInt.asUintN(32, value >> 32n));
