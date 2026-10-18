import { MAXIMUM_STIRLING_WORK } from "#src/services/function/constants";

// The column of parts, for a few parts: S(m, r) = r S(m - 1, r) + S(m - 1, r - 1), updated in place from the highest part down
const computeStirlingColumn = (count: number, parts: number): number => {
  const column: number[] = Array.from({ length: parts + 1 }, (_element, index) => (index === 0 ? 1 : 0));
  for (let step = 1; step <= count; step++) {
    for (let part = parts; part >= 1; part--) column[part] = part * (column[part] ?? 0) + (column[part - 1] ?? 0);
    column[0] = 0;
  }
  return column[parts] ?? 0;
};
// The diagonal below the parts, for a few counts short of the count: D(m, i) = S(m, m - i) = (m - i) D(m - 1, i - 1) + D(m - 1, i)
const computeStirlingDiagonal = (count: number, index: number): number => {
  const diagonal: number[] = Array.from({ length: index + 1 }, (_element, position) => (position === 0 ? 1 : 0));
  for (let step = 1; step <= count; step++)
    for (let position = Math.min(step, index); position >= 1; position--)
      diagonal[position] = (step - position) * (diagonal[position - 1] ?? 0) + (diagonal[position] ?? 0);
  return diagonal[index] ?? 0;
};

export const computeStirlingSecondKind = (count: number, parts: number): null | number => {
  if (!Number.isInteger(count) || !Number.isInteger(parts) || count < 0 || parts < 0 || parts > count) return null;
  const band = Math.min(parts, count - parts);
  if (count * band > MAXIMUM_STIRLING_WORK) return null;
  return band === parts ? computeStirlingColumn(count, parts) : computeStirlingDiagonal(count, count - parts);
};
