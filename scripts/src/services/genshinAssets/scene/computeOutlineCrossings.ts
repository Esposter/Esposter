// Where an outline's edges cross a depth, the x of each edge that spans it
export const computeOutlineCrossings = (outline: readonly [number, number][], depth: number): number[] =>
  outline.flatMap(([x, z], index) => {
    const [nextX = x, nextZ = z] = outline[(index + 1) % outline.length] ?? [];
    if ((z - depth) * (nextZ - depth) > 0 || z === nextZ) return [];
    else return [x + ((depth - z) / (nextZ - z)) * (nextX - x)];
  });
