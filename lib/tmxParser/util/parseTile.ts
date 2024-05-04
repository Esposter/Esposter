import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXTile } from "@/lib/tmxParser/models/tmx/TMXTile";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { getFlattenedProperties } from "@/lib/tmxParser/util/getFlattenedProperties";
import { parseObject } from "@/lib/tmxParser/util/parseObject";

export const parseTile = (node: TMXNode<TMXTile>): TMXTile => {
  const { $, animation, objectgroup, properties } = node;
  const tile: Record<string, unknown> = {};
  if (Array.isArray(animation))
    tile.animation = {
      frames: animation[0].frame.map(({ $ }) => Object.assign({}, ...getAttributes($))),
    };
  if (Array.isArray(objectgroup) && Array.isArray(objectgroup[0].object))
    tile.objects = objectgroup[0].object.map((o) => parseObject(o));
  return Object.assign({ ...tile, ...getFlattenedProperties(properties) }, ...getAttributes($));
};
