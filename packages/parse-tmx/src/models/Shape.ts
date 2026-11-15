export const Shape = {
  Ellipse: "ellipse",
  Point: "point",
  Polygon: "polygon",
  Polyline: "polyline",
  Rectangle: "rectangle",
} as const;
export type Shape = (typeof Shape)[keyof typeof Shape];
