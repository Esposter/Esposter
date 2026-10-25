export const getLowWord = (value: bigint): number => Number(BigInt.asUintN(32, value));
