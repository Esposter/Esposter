export const getLowHalfWord = (value: bigint): number => Number(BigInt.asUintN(16, value));
