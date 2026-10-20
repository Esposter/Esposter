// A slot's children run across a row when the first two measured children share a top, and down a column otherwise
export const checkIsHorizontalSlot = (childRects: readonly (undefined | { top: number })[]): boolean => {
  const [first, second] = childRects.filter((rect) => rect !== undefined);
  return first !== undefined && second !== undefined && first.top === second.top;
};
