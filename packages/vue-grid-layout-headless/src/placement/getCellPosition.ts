// The offset of the nth cell, past the padding that comes before the first
export const getCellPosition = (index: number, pitch: number, padding: number): number =>
  Math.round(index * pitch + padding);
