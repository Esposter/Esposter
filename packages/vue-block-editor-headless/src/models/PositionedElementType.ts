// The kinds of element a positioned document holds, each the value of its element's type
export const PositionedElementType = {
  Arrow: "arrow",
  Image: "image",
  Shape: "shape",
  StickyNote: "stickyNote",
  Stroke: "stroke",
  Text: "text",
} as const;
export type PositionedElementType = (typeof PositionedElementType)[keyof typeof PositionedElementType];
