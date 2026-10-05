// A proportion a reference shows between two parts that meet: the four ends their widths mark on the line where they
// Meet, in order along it, as pixels measured on the reference and as metres read off the fitted data. A projection
// Keeps the cross-ratio of four points on a line, so both give one cross-ratio from any pose, which a wrong scale or a
// Wrong part breaks
export interface ArrangementRatio {
  ends: [number, number, number, number];
  readEnds: () => Promise<[number, number, number, number]>;
  // The reference the ends were measured on, and where along it
  reference: string;
}
