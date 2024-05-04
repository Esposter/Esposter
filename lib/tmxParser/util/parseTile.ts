import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXTile } from "@/lib/tmxParser/models/tmx/TMXTile";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { parseObject } from "@/lib/tmxParser/util/parseObject";
import { parseProperties } from "@/lib/tmxParser/util/parseProperties";

export const parseTile = (node: TMXNode<TMXTile>): TMXTile => {
  const { $, animation, objectgroup, properties } = node;
  const tile: Record<string, unknown> = {};
  if (animation)
    tile.animation = {
      frames: animation[0].frame.map(({ $ }) => Object.assign({}, ...getAttributes($))),
    };
  if (objectgroup) tile.objects = objectgroup[0].object.map((o) => parseObject(o));
  return Object.assign({ ...tile, properties: parseProperties(properties) }, ...getAttributes($));
};
