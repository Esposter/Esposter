import type { TMXEmbeddedTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXEmbeddedTilesetNode";
import { TMXNodeType } from "@/lib/tmxParser/models/tmx/node/TMXNodeType";
import type { TMXTilesetNode } from "@/lib/tmxParser/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "@/lib/tmxParser/models/tmx/shared/TMXImageShared";
import { isExternalTileset } from "@/lib/tmxParser/util/isExternalTileset";
import { parseTile } from "@/lib/tmxParser/util/parseTile";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

export const parseTileset = (node: TMXTilesetNode): TMXTilesetParsed => {
  if (isExternalTileset(node.$)) return structuredClone(node.$);

  const { $, $$, tile } = node as TMXEmbeddedTilesetNode;

  for (const childNode of $$ ?? []) {
    const tmxNodeType = childNode["#name"] as TMXNodeType;
    if (tmxNodeType !== TMXNodeType.Image) continue;

    const image = structuredClone(childNode.$ as TMXImageShared);
    const tiles = tile?.map((t) => parseTile(t)) ?? [];
    return { ...$, image, tiles };
  }

  throw new InvalidOperationError(Operation.Read, parseTileset.name, $.name);
};
