import type { TMXEmbeddedTilesetNode } from "#src/models/tmx/node/TMXEmbeddedTilesetNode";
import type { TMXTilesetNode } from "#src/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "#src/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "#src/models/tmx/shared/TMXImageShared";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { checkIsExternalTileset } from "#src/util/checkIsExternalTileset";
import { parseTile } from "#src/util/parseTile";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const parseTileset = (node: TMXTilesetNode): TMXTilesetParsed => {
  if (checkIsExternalTileset(node.$)) return structuredClone(node.$);

  const { $, $$, tile } = node as TMXEmbeddedTilesetNode;

  for (const childNode of $$) {
    const tmxNodeType = childNode["#name"];
    if (tmxNodeType !== TMXNodeType.Image) continue;

    const image = structuredClone(childNode.$ as TMXImageShared);
    const tiles = tile?.map((t) => parseTile(t)) ?? [];
    return { ...$, image, tiles };
  }

  throw new InvalidOperationError(Operation.Read, parseTileset.name, $.name);
};
