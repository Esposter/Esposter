import type { TMXTileNode } from "@/models/tmx/node/TMXTileNode";
import type { TMXTileParsed } from "@/models/tmx/parsed/TMXTileParsed";

import { parseObject } from "@/util/parseObject";
import { parseProperties } from "@/util/parseProperties";
import { takeOne } from "@esposter/shared";

export const parseTile = (node: TMXTileNode): TMXTileParsed => {
  const { $, animation, objectgroup, properties } = node;
  const tile = structuredClone($) as TMXTileParsed;
  if (animation)
    tile.animation = {
      frames: takeOne(takeOne(animation), "frame").map(({ $ }) => structuredClone($)),
    };
  if (objectgroup) tile.objects = takeOne(takeOne(objectgroup), "object").map((o) => parseObject(o));
  if (properties) tile.properties = parseProperties(properties);
  return tile;
};
