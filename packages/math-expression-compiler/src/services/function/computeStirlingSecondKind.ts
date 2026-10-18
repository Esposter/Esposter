import { computeStirlingColumn } from "#src/services/function/computeStirlingColumn";
import { computeStirlingDiagonal } from "#src/services/function/computeStirlingDiagonal";
import { MAXIMUM_STIRLING_WORK } from "#src/services/function/constants";

export const computeStirlingSecondKind = (count: number, parts: number): null | number => {
  if (!Number.isInteger(count) || !Number.isInteger(parts) || count < 0 || parts < 0 || parts > count) return null;
  const band = Math.min(parts, count - parts);
  if (count * band > MAXIMUM_STIRLING_WORK) return null;
  return band === parts ? computeStirlingColumn(count, parts) : computeStirlingDiagonal(count, count - parts);
};
