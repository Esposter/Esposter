// The kept points with `point` placed among them: after every kept point no farther than it, so a tie keeps the order
// The points were found in, and only the `count` nearest stay
export const insertNearest = (
  kept: readonly { distance: number; index: number }[],
  point: { distance: number; index: number },
  count: number,
): { distance: number; index: number }[] => {
  const position = kept.findIndex((other) => other.distance > point.distance);
  return kept.toSpliced(position === -1 ? kept.length : position, 0, point).slice(0, count);
};
