// The cross-ratio of four points in order along a line, (c − a)(d − b) / ((c − b)(d − a)): a projection keeps it, so
// Four ends measured in pixels on any view of the line give the one four ends in metres along it give
export const computeCrossRatio = ([a, b, c, d]: readonly [number, number, number, number]): number =>
  ((c - a) * (d - b)) / ((c - b) * (d - a));
