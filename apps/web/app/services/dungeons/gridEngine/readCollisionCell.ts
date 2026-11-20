// The collision of one position across every layer: a blocking tile on any layer blocks, an open tile on some layer
// Leaves it open, and no tile on any layer leaves it absent
export const readCollisionCell = (cells: readonly (boolean | undefined)[]): boolean | undefined => {
  if (cells.includes(true)) return true;
  return cells.includes(false) ? false : undefined;
};
