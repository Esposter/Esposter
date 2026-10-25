export const countPassed = (edges: readonly number[], value: number): number =>
  edges.filter((edge) => value > edge).length;
