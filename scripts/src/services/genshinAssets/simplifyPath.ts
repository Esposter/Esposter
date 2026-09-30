// Douglas-Peucker: the point farthest from the chord kept while it strays past the tolerance, split there and again
export const simplifyPath = (points: readonly [number, number][], tolerance: number): [number, number][] => {
  const [first, last] = [points[0], points.at(-1)];
  if (!first || !last || points.length < 3) return [...points];
  const [ax, ay] = first;
  const [bx, by] = last;
  const length = Math.hypot(bx - ax, by - ay) || 1;
  let farthestIndex = 0;
  let farthestDistance = 0;
  for (const [index, [px, py]] of points.entries()) {
    const distance = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / length;
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
