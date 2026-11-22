// SigV4 sorts by code unit, not by locale
export const compareCodeUnits = (firstText: string, secondText: string): number =>
  firstText < secondText ? -1 : firstText > secondText ? 1 : 0;
