// Douglas-Peucker over points of any dimension: the point farthest from the chord's line kept while it strays past the
// Tolerance, split there and again. A chord whose ends meet keeps only its ends
export const simplifyPath = <T extends readonly number[]>(points: readonly T[], tolerance: number): T[] => {
  const [first, last] = [points[0], points.at(-1)];
  if (!first || !last || points.length < 3) return [...points];
  const chord = first.map((value, axis) => (last[axis] ?? 0) - value);
  const chordLengthSquared = chord.reduce((sum, value) => sum + value * value, 0);
  let farthestIndex = 0;
  let farthestDistance = 0;
  for (const [index, point] of points.entries()) {
    const offset = point.map((value, axis) => value - (first[axis] ?? 0));
    const offsetLengthSquared = offset.reduce((sum, value) => sum + value * value, 0);
    const projected = offset.reduce((sum, value, axis) => sum + value * (chord[axis] ?? 0), 0);
    const distance =
      chordLengthSquared === 0
        ? 0
        : Math.sqrt(Math.max(0, offsetLengthSquared - (projected * projected) / chordLengthSquared));
    if (distance > farthestDistance) {
      farthestDistance = distance;
      farthestIndex = index;
    }
  }
  if (farthestDistance <= tolerance) return [first, last];
  return [
    ...simplifyPath(points.slice(0, farthestIndex + 1), tolerance).slice(0, -1),
    ...simplifyPath(points.slice(farthestIndex), tolerance),
  ];
};
