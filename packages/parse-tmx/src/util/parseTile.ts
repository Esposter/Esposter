import type { TMXTileNode } from "#src/models/tmx/node/TMXTileNode";
import type { TMXTileParsed } from "#src/models/tmx/parsed/TMXTileParsed";

import { parseObject } from "#src/util/parseObject";
import { parseProperties } from "#src/util/parseProperties";
import { takeOne } from "@esposter/shared";

export const parseTile = (node: TMXTileNode): TMXTileParsed => {
  const { $, animation, objectgroup, properties } = node;
  const tile = structuredClone($) as TMXTileParsed;
  if (animation)
    tile.animation = {
      frames: takeOne(takeOne(animation), "frame").map(({ $: frameData }) => structuredClone(frameData)),
    };
  if (objectgroup) tile.objects = takeOne(takeOne(objectgroup), "object").map((o) => parseObject(o));
  if (properties) tile.properties = parseProperties(properties);
  return tile;
};
