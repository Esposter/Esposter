import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { getFlips } from "@/lib/tmxParser/util/getFlips";
import { getObjectShape } from "@/lib/tmxParser/util/getObjectShape";
import { getTileId } from "@/lib/tmxParser/util/getTileId";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

export const parseObjectData = (node: TMXNode<TMXObject>): TMXObject => {
  const { $, properties, polygon, text } = node;
  const objectData: Record<string, unknown> = {};

  if (Array.isArray(polygon))
    objectData.points = polygon[0].$.points.split(" ").map((point: { split: (arg0: string) => [string, string] }) => {
      const [x, y] = point.split(",");
      return [parseFloat(x), parseFloat(y)];
    });

  const object = Object.assign(
    {
      ...objectData,
      shape: getObjectShape(node),
      ...getFlattenedProperties(properties),
    },
    ...getAttributes($),
  );

  if (Array.isArray(text)) {
    const textNode = text[0] as TMXNode<TiledObjectProperty<string>>;
    object.text = textNode._;
    object.properties = Object.assign({}, object.properties, textNode.$);
  }

  if (object.gid) {
    object.flips = getFlips(object.gid);
    object.gid = getTileId(object.gid);
  }

  return object;
};
