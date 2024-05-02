import { Shape } from "@/lib/tmxParser/models/Shape";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";

export const getObjectShape = (node: TMXNode<TMXObject>): Shape => {
  if ("point" in node) return Shape.Point;
  else if ("ellipse" in node) return Shape.Ellipse;
  else if ("polygon" in node) return Shape.Polygon;
  else return Shape.Rectangle;
};
