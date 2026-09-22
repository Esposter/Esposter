import type { TMXEmbeddedTilesetNode } from "#src/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXTilesetNode } from "#src/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "#src/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "#src/models/tmx/shared/TMXImageShared";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { checkIsExternalTileset } from "#src/services/checkIsExternalTileset";
import { parseTile } from "#src/services/parseTile";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const parseTileset = (node: TMXTilesetNode): TMXTilesetParsed => {
  if (checkIsExternalTileset(node.$)) return structuredClone(node.$);

  const { $, $$, tile } = node as TMXEmbeddedTilesetNode;
  const imageNode = $$.find((childNode) => childNode["#name"] === TMXNodeType.Image);
  if (!imageNode) throw new InvalidOperationError(Operation.Read, parseTileset.name, $.name);

  const image = structuredClone(imageNode.$ as TMXImageShared);
  const tiles = tile?.map((tileNode) => parseTile(tileNode)) ?? [];
  return { ...$, image, tiles };
};
