// Whether the outer range holds the inner one from its start to its end
export const checkIsRangeContaining = (outerRange: [number, number], innerRange: [number, number]): boolean =>
  outerRange[0] <= innerRange[0] && outerRange[1] >= innerRange[1];
