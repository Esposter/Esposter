import { computeStirlingColumn } from "#src/services/function/computeStirlingColumn";
import { computeStirlingDiagonal } from "#src/services/function/computeStirlingDiagonal";
import { MAXIMUM_STIRLING_WORK } from "#src/services/function/constants";

// Zero parts partition only the empty set, and a count into as many parts as it has is all singletons, so both are answered
// Directly. Past them the narrower band is at least one, so count times band is the length of the loop
export const computeStirlingSecondKind = (count: number, parts: number): null | number => {
  if (!Number.isInteger(count) || !Number.isInteger(parts) || count < 0 || parts < 0 || parts > count) return null;
  if (parts === 0) return count === 0 ? 1 : 0;
  if (parts === count) return 1;

  const band = Math.min(parts, count - parts);
  if (count * band > MAXIMUM_STIRLING_WORK) return null;
  return band === parts ? computeStirlingColumn(count, parts) : computeStirlingDiagonal(count, count - parts);
};
