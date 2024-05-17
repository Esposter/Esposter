import type { TMXEmbeddedTilesetNode } from "@/models/tmx/node/TMXEmbeddedTilesetNode";
import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import type { TMXTilesetNode } from "@/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "@/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "@/models/tmx/shared/TMXImageShared";
import { isExternalTileset } from "@/util/isExternalTileset";
import { parseTile } from "@/util/parseTile";
import { InvalidOperationError, Operation } from "esposter-shared";

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
