// The point of any of several closed loops nearest a point
export const findNearestEdgePoint = (
  loops: readonly [number, number][][],
  [px, py]: [number, number],
): [number, number] => {
  let nearest: [number, number] = [px, py];
  let nearestDistance = Infinity;
  for (const loop of loops)
    for (const [index, [ax, ay]] of loop.entries()) {
      const [bx, by] = loop[(index + 1) % loop.length] ?? [ax, ay];
      const lengthSquared = (bx - ax) ** 2 + (by - ay) ** 2;
      const along = lengthSquared
        ? Math.min(Math.max(((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / lengthSquared, 0), 1)
        : 0;
      const point: [number, number] = [ax + along * (bx - ax), ay + along * (by - ay)];
      const distance = Math.hypot(point[0] - px, point[1] - py);
      if (distance >= nearestDistance) continue;
      nearest = point;
      nearestDistance = distance;
    }
  return nearest;
};
