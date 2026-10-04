// The area a closed loop encloses, by the shoelace formula, whichever way round it runs
export const computeLoopArea = (loop: readonly (readonly [number, number])[]): number =>
  Math.abs(
    loop.reduce((sum, [x, y], index) => {
      const [nextX, nextY] = loop[(index + 1) % loop.length] ?? [x, y];
      return sum + x * nextY - nextX * y;
    }, 0),
  ) / 2;
