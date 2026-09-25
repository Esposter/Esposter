import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";

import { cloneNodeWithType } from "#src/services/cloneNodeWithType";
import { decodeTileData } from "#src/services/decodeTileData";
import { parseFlips } from "#src/services/parseFlips";
import { parseProperties } from "#src/services/parseProperties";
import { parseTileId } from "#src/services/parseTileId";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export const parseTileLayer = async (
  node: TMXLayerNode,
  tileCount: number,
  translateFlips: boolean,
): Promise<TMXLayerParsed> => {
  const { data, properties } = node;
  if (!data) throw new InvalidOperationError(Operation.Read, "TMXLayer", "data is missing");

  const layer = cloneNodeWithType<TMXLayerParsed>(node);
  if (properties) layer.properties = parseProperties(properties);

  const nodeData = takeOne(data);
  // Every form the data is written in decodes to one gid per cell, so the count is checked once, here, on what
  // The decode produced rather than by each form in its own units
  const tiles = await decodeTileData(nodeData);
  if (tiles.length !== tileCount)
    throw new InvalidOperationError(
      Operation.Read,
      "TMXLayer",
      `expected ${tileCount} tiles, received ${tiles.length}`,
    );

  if (translateFlips) {
    layer.data = tiles.map((gid) => parseTileId(gid));
    layer.flips = tiles.map((gid) => parseFlips(gid));
  } else layer.data = tiles;

  return layer;
};
