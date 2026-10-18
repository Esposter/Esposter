// The column of parts, for a few parts: S(m, r) = r S(m - 1, r) + S(m - 1, r - 1), updated in place from the highest part down
export const computeStirlingColumn = (count: number, parts: number): number => {
  const column: number[] = Array.from({ length: parts + 1 }, (_element, index) => (index === 0 ? 1 : 0));
  for (let step = 1; step <= count; step++) {
    for (let part = parts; part >= 1; part--) column[part] = part * (column[part] ?? 0) + (column[part - 1] ?? 0);
    column[0] = 0;
  }
  return column[parts] ?? 0;
};
