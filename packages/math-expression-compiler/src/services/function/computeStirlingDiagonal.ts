// The diagonal below the parts, for a few counts short of the count: D(m, i) = S(m, m - i) = (m - i) D(m - 1, i - 1) + D(m - 1, i)
export const computeStirlingDiagonal = (count: number, index: number): number => {
  const diagonal: number[] = Array.from({ length: index + 1 }, (_element, position) => (position === 0 ? 1 : 0));
  for (let step = 1; step <= count; step++)
    for (let position = Math.min(step, index); position >= 1; position--)
      diagonal[position] = (step - position) * (diagonal[position - 1] ?? 0) + (diagonal[position] ?? 0);
  return diagonal[index] ?? 0;
};
