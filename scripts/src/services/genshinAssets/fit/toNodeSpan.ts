// A point's place between the nodes along one axis, kept to the grid: its lower node, its upper node and how far past
// The lower it stands
export const toNodeSpan = (
  value: number,
  origin: number,
  cellSize: number,
  nodeCount: number,
): [number, number, number] => {
  const coordinate = Math.min(Math.max((value - origin) / cellSize, 0), nodeCount - 1);
  const lower = Math.floor(coordinate);
  return [lower, Math.min(lower + 1, nodeCount - 1), coordinate - lower];
};
