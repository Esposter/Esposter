// The Bell numbers grow with their index, so the first row whose start overflows makes every later one infinite too
export const computeBellNumber = (index: number): null | number => {
  if (!Number.isInteger(index) || index < 0) return null;
  let row = [1];
  for (let step = 1; step <= index; step++) {
    const next = [row.at(-1) ?? 0];
    for (const above of row) next.push((next.at(-1) ?? 0) + above);
    if (next[0] === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
    row = next;
  }
  return row[0] ?? Number.NaN;
};
