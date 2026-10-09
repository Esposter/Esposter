// Whether a choice of indices into a list of this length names each position once, and no position outside it
export const checkIsGcgIndexSelection = (indices: number[], length: number): boolean =>
  new Set(indices).size === indices.length &&
  indices.every((index) => Number.isInteger(index) && index >= 0 && index < length);
