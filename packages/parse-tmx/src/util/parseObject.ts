import type { TMXObjectNode } from "@/src/models/tmx/node/TMXObjectNode";
import type { TMXObjectParsed } from "@/src/models/tmx/parsed/TMXObjectParsed";
import { parseFlips } from "@/src/util/parseFlips";
import { parseObjectShape } from "@/src/util/parseObjectShape";
import { parseProperties } from "@/src/util/parseProperties";
import { parseTileId } from "@/src/util/parseTileId";

export const parseObject = (node: TMXObjectNode): TMXObjectParsed => {
  const { $, polygon, text, properties } = node;
  const object = structuredClone($) as TMXObjectParsed;
  object.shape = parseObjectShape(node);

  if (properties) object.properties = parseProperties(properties);

  if (polygon)
    object.points = polygon[0].$.points.split(" ").map((point) => {
      const [x, y] = point.split(",");
      return [parseFloat(x), parseFloat(y)];
    });

  if (text) {
    const textNode = text[0];
    object.text = textNode._;
    object.properties = Object.assign({}, object.properties, textNode.$);
  }

  if (object.gid) {
    object.flips = parseFlips(object.gid);
    object.gid = parseTileId(object.gid);
  }

  return object;
};