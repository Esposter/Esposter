// The cells of a grid a row wide joined into components through their four neighbours, each a list of its cells; a grid
// Unrolled round an axis wraps its columns, so a component crossing its seam stays one
export const findCellComponents = (
  cells: readonly number[],
  { isWrapped = false, width }: { isWrapped?: boolean; width: number },
): number[][] => {
  const unvisited = new Set(cells);
  const components: number[][] = [];
  for (const start of cells) {
    if (!unvisited.delete(start)) continue;
    const component = [start];
    // An array's iterator reads what is pushed while it runs, so each cell found is visited in turn
    for (const cell of component) {
      const column = cell % width;
      const rowStart = cell - column;
      const left = column > 0 ? cell - 1 : isWrapped ? rowStart + width - 1 : -1;
      const right = column < width - 1 ? cell + 1 : isWrapped ? rowStart : -1;
      for (const neighbour of [left, right, cell - width, cell + width])
        if (unvisited.delete(neighbour)) component.push(neighbour);
    }
    components.push(component);
  }
  return components;
};
