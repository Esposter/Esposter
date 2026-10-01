// A value through a channel's fitted grade, the piecewise linear curve its knots, spread evenly over 0 to 1, draw
export const applyGradeCurve = (knots: readonly number[], value: number): number => {
  const position = Math.min(Math.max(value, 0), 1) * (knots.length - 1);
  const lower = Math.min(Math.floor(position), knots.length - 2);
  const share = position - lower;
  return (knots[lower] ?? 0) * (1 - share) + (knots[lower + 1] ?? 0) * share;
};
