// Whether two ranges share at least one character
export const checkIsRangeOverlapping = (range: [number, number], otherRange: [number, number]): boolean =>
  range[0] < otherRange[1] && otherRange[0] < range[1];
