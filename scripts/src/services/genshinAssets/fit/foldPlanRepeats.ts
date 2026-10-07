import type { Vector } from "#src/models/shared/Vector";

// A plan's colours averaged over each block of so many cells a side and over every repeat of its rows, so a surface
// Painted in a pattern that repeats along the plan is read once, past the speckle each repeat paints differently: each
// Folded cell the mean of the drawn cells under it that carry the tag most of them do, and tagged -1 where none is drawn
export const foldPlanRepeats = (
  colors: readonly Vector[],
  tags: Int16Array,
  { block, height, repeats, width }: { block: number; height: number; repeats: number; width: number },
): { colors: Vector[]; height: number; tags: Int16Array; width: number } => {
  const foldedWidth = Math.floor(width / block);
  const foldedHeight = Math.floor(height / repeats / block);
  const foldedColors: Vector[] = [];
  const foldedTags = new Int16Array(foldedWidth * foldedHeight).fill(-1);
  for (let row = 0; row < foldedHeight; row++)
    for (let column = 0; column < foldedWidth; column++) {
      const tagCellsMap = new Map<number, number[]>();
      for (let repeat = 0; repeat < repeats; repeat++)
        for (let blockRow = 0; blockRow < block; blockRow++)
          for (let blockColumn = 0; blockColumn < block; blockColumn++) {
            const cell =
              (repeat * foldedHeight * block + row * block + blockRow) * width + column * block + blockColumn;
            const tag = tags[cell] ?? -1;
            if (tag < 0) continue;
            const tagCells = tagCellsMap.get(tag) ?? [];
            tagCells.push(cell);
            tagCellsMap.set(tag, tagCells);
          }
      const [tag = -1, cells = []] =
        [...tagCellsMap].toSorted(([, firstCells], [, secondCells]) => secondCells.length - firstCells.length)[0] ?? [];
      const folded = row * foldedWidth + column;
      foldedTags[folded] = tag;
      foldedColors[folded] = ([0, 1, 2] as const).map(
        (channel) => cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) / Math.max(cells.length, 1),
      ) as Vector;
    }
  return { colors: foldedColors, height: foldedHeight, tags: foldedTags, width: foldedWidth };
};
