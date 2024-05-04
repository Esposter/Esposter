import { NodeType } from "@/lib/tmxParser/models/NodeType";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";
import { getAttributes } from "@/lib/tmxParser/util/getAttributes";
import { isExternalTileset } from "@/lib/tmxParser/util/isExternalTileset";
import { parseTileData } from "@/lib/tmxParser/util/parseTileData";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

export const parseTileset = (node: TMXNode<TMXTileset>): TMXTileset => {
  const { $, $$, tile } = node;

  if (isExternalTileset($)) return Object.assign({}, ...getAttributes($));

  for (const childNode of $$) {
    const nodeType = childNode["#name"] as NodeType;
    if (nodeType !== NodeType.Image) continue;

    const image = Object.assign({}, ...getAttributes(childNode.$));
    const tiles = Array.isArray(tile) && tile.map((t) => parseTileData(t));
    return Object.assign({}, ...getAttributes($), { image, tiles });
  }

  throw new InvalidOperationError(Operation.Read, parseTileset.name, node.properties.toString());
};
