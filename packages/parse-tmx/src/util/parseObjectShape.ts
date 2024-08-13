import type { TMXObjectNode } from "@/models/tmx/node/TMXObjectNode";

import { Shape } from "@/models/Shape";

export const parseObjectShape = (node: TMXObjectNode): Shape => {
  if ("point" in node) return Shape.Point;
  else if ("ellipse" in node) return Shape.Ellipse;
  else if ("polygon" in node) return Shape.Polygon;
  else return Shape.Rectangle;
};
