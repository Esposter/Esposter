// The edge or centre of a selection's box that a selection of boxes lines up at: the left, centre or right edge, or the top, middle or bottom edge
export const AlignEdge = {
  Bottom: "bottom",
  Centre: "centre",
  Left: "left",
  Middle: "middle",
  Right: "right",
  Top: "top",
} as const;
export type AlignEdge = (typeof AlignEdge)[keyof typeof AlignEdge];
