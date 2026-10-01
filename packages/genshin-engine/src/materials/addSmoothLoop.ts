// A traced loop added to a path as a smooth curve through its edges' midpoints, each of its points bending it, so a
// Loop traced off a grid rounds its stepped corners as the shape it was traced from did
export const addSmoothLoop = (path: Path2D, points: readonly (readonly [number, number])[]): void => {
  if (points.length < 3) return;
  const readMidpoint = (index: number): [number, number] => {
    const [startX = 0, startY = 0] = points[index % points.length] ?? [];
    const [endX = 0, endY = 0] = points[(index + 1) % points.length] ?? [];
    return [(startX + endX) / 2, (startY + endY) / 2];
  };
  path.moveTo(...readMidpoint(points.length - 1));
  for (const [index, [x, y]] of points.entries()) path.quadraticCurveTo(x, y, ...readMidpoint(index));
  path.closePath();
};
