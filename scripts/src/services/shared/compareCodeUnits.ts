// Code unit order, the same on every machine, unlike a locale's collation, so committed files sort identically anywhere
export const compareCodeUnits = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
