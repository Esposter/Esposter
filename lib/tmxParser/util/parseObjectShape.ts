import { Shape } from "@/lib/tmxParser/models/Shape";
import type { TMXObjectNode } from "@/lib/tmxParser/models/tmx/node/TMXObjectNode";

export const parseObjectShape = (node: TMXObjectNode): Shape => {
  if ("point" in node) return Shape.Point;
  else if ("ellipse" in node) return Shape.Ellipse;
  else if ("polygon" in node) return Shape.Polygon;
  else return Shape.Rectangle;
};
