import { NodeType } from "@/lib/tmxParser/models/NodeType";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { isEmbeddedTileset } from "@/lib/tmxParser/util/isEmbeddedTileset";
import { parseTileData } from "@/lib/tmxParser/util/parseTileData";

export const parseTileset = (node: TMXNode<TMXTileset>): TMXTileset => {
  const { $, $$, tile } = node;

  if (isEmbeddedTileset($))
    for (const childNode of $$) {
      const nodeType = childNode["#name"] as NodeType;
      if (nodeType !== NodeType.Image) continue;

      const image = Object.assign({}, ...getAttributes(childNode.$));
      const tiles = Array.isArray(tile) && tile.map((t) => parseTileData(t));
      return Object.assign({}, ...getAttributes($), { image, tiles });
    }

  return Object.assign({}, ...getAttributes($));
};
