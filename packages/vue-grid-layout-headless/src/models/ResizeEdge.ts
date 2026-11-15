// The edge or corner a resize pulls: a north or south edge moves the top or bottom, an east or west edge the sides
export const ResizeEdge = {
  East: "East",
  North: "North",
  NorthEast: "NorthEast",
  NorthWest: "NorthWest",
  South: "South",
  SouthEast: "SouthEast",
  SouthWest: "SouthWest",
  West: "West",
} as const;
export type ResizeEdge = (typeof ResizeEdge)[keyof typeof ResizeEdge];
