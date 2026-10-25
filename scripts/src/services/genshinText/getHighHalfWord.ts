export const getHighHalfWord = (value: bigint): number => Number(BigInt.asUintN(16, value >> 32n));
