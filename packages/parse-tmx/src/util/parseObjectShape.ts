import type { TMXObjectNode } from "#src/models/tmx/node/TMXObjectNode";

import { Shape } from "#src/models/Shape";

export const parseObjectShape = (node: TMXObjectNode): Shape => {
  if ("point" in node) return Shape.Point;
  else if ("ellipse" in node) return Shape.Ellipse;
  else if ("polygon" in node) return Shape.Polygon;
  else return Shape.Rectangle;
};
