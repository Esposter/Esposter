import type { TMXTileNode } from "@/models/tmx/node/TMXTileNode";
import type { TMXTileParsed } from "@/models/tmx/parsed/TMXTileParsed";

import { parseObject } from "@/utils/parseObject";
import { parseProperties } from "@/utils/parseProperties";

export const parseTile = (node: TMXTileNode): TMXTileParsed => {
  const { $, animation, objectgroup, properties } = node;
  const tile = structuredClone($) as TMXTileParsed;
  if (animation)
    tile.animation = {
      frames: animation[0].frame.map(({ $ }) => structuredClone($)),
    };
  if (objectgroup) tile.objects = objectgroup[0].object.map((o) => parseObject(o));
  if (properties) tile.properties = parseProperties(properties);
  return tile;
};
