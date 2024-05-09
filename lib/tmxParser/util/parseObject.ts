import type { TMXObjectNode } from "@/lib/tmxParser/models/tmx/node/TMXObjectNode";
import type { TMXObjectParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXObjectParsed";
import { parseFlips } from "@/lib/tmxParser/util/parseFlips";
import { parseObjectShape } from "@/lib/tmxParser/util/parseObjectShape";
import { parseProperties } from "@/lib/tmxParser/util/parseProperties";
import { parseTileId } from "@/lib/tmxParser/util/parseTileId";

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
